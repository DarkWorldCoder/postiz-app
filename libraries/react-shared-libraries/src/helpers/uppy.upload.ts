import XHRUpload from '@uppy/xhr-upload';
import AwsS3Multipart from '@uppy/aws-s3';
import sha256 from 'sha256';
import Transloadit from '@uppy/transloadit';

const uploadPartBytesWithEtagGuard = async ({
  signature: { url, expires, headers, method = 'PUT' },
  body,
  size = body.size,
  onProgress,
  onComplete,
  signal,
}: {
  signature: {
    url: string;
    expires?: number;
    headers?: Record<string, string>;
    method?: string;
  };
  body: Blob;
  size?: number;
  onProgress?: (event: { loaded: number; lengthComputable: boolean }) => void;
  onComplete?: (etag: string) => void;
  signal?: AbortSignal;
}) => {
  if (!url) {
    throw new Error('Cannot upload to an undefined URL');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    xhr.responseType = 'text';
    if (typeof expires === 'number') {
      xhr.timeout = expires * 1000;
    }

    const onAbort = () => {
      xhr.abort();
    };

    const cleanup = () => {
      signal?.removeEventListener('abort', onAbort);
    };

    signal?.addEventListener('abort', onAbort);
    xhr.upload.addEventListener('progress', (event) => {
      onProgress?.(event);
    });

    xhr.addEventListener('abort', () => {
      cleanup();
      reject(new Error('Upload aborted'));
    });

    xhr.addEventListener('timeout', () => {
      cleanup();
      reject(new Error('Request has expired'));
    });

    xhr.addEventListener('load', () => {
      cleanup();

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Upload failed with status ${xhr.status}`));
        return;
      }

      onProgress?.({ loaded: size, lengthComputable: true });

      const headersMap = xhr
        .getAllResponseHeaders()
        .trim()
        .split(/[\r\n]+/)
        .reduce<Record<string, string>>((acc, line) => {
          const parts = line.split(': ');
          const header = parts.shift();
          if (!header) {
            return acc;
          }

          acc[header.toLowerCase()] = parts.join(': ');
          return acc;
        }, {});

      const etag = headersMap.etag;
      if (!etag) {
        reject(
          new Error(
            'Multipart upload is missing the ETag response header. Add storage CORS with ExposeHeaders including ETag.'
          )
        );
        return;
      }

      onComplete?.(etag);
      resolve({
        ...headersMap,
        ETag: etag,
      });
    });

    xhr.addEventListener('error', () => {
      cleanup();
      reject(new Error('Unknown upload error'));
    });

    xhr.send(body);
  });
};

const fetchUploadApiEndpoint = async (
  fetch: any,
  endpoint: string,
  data: any
) => {
  const res = await fetch(`/media/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(
      body?.message || `Upload request failed with status ${res.status}`
    );
  }
  return body;
};

const getMultipartUploadOptions = (fetch: any) => ({
  shouldUseMultipart: (file: any) => true,
  uploadPartBytes: uploadPartBytesWithEtagGuard,
  endpoint: '',
  createMultipartUpload: async (file: any) => {
    let fileHash = '';
    const contentType = file.type;

    // Skip hash calculation for files larger than 100MB to avoid "Invalid array length" error
    if (file.size <= 100 * 1024 * 1024) {
      try {
        const arrayBuffer = await new Response(file.data).arrayBuffer();
        fileHash = sha256(Buffer.from(arrayBuffer));
      } catch (error) {
        console.warn(
          'Failed to calculate file hash, proceeding without hash:',
          error
        );
        fileHash = '';
      }
    }

    return fetchUploadApiEndpoint(fetch, 'create-multipart-upload', {
      file,
      fileHash,
      contentType,
    });
  },
  listParts: (file: any, props: any) =>
    fetchUploadApiEndpoint(fetch, 'list-parts', {
      file,
      ...props,
    }),
  signPart: (file: any, props: any) =>
    fetchUploadApiEndpoint(fetch, 'sign-part', {
      file,
      ...props,
    }),
  abortMultipartUpload: (file: any, props: any) =>
    fetchUploadApiEndpoint(fetch, 'abort-multipart-upload', {
      file,
      ...props,
    }),
  completeMultipartUpload: (file: any, props: any) =>
    fetchUploadApiEndpoint(fetch, 'complete-multipart-upload', {
      file,
      ...props,
    }),
});

// Define the factory to return appropriate Uppy configuration
export const getUppyUploadPlugin = (
  provider: string,
  fetch: any,
  backendUrl: string,
  transloadit: string[] = []
) => {
  switch (provider) {
    case 'transloadit':
      return {
        plugin: Transloadit,
        options: {
          waitForEncoding: true,
          alwaysRunAssembly: true,
          assemblyOptions: {
            params: {
              auth: { key: transloadit[0] },
              template_id: transloadit[1],
            },
          },
        },
      };
    case 'cloudflare':
    case 's3':
      return {
        plugin: AwsS3Multipart,
        options: getMultipartUploadOptions(fetch),
      };
    case 'local':
      return {
        plugin: XHRUpload,
        options: {
          endpoint: `${backendUrl}/media/upload-server`,
          withCredentials: true,
        },
      };

    // Add more cases for other cloud providers
    default:
      throw new Error(`Unsupported storage provider: ${provider}`);
  }
};
