import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import 'multer';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import { IUploadProvider } from './upload.interface';
import { isSafePublicHttpsUrl } from '@gitroom/nestjs-libraries/dtos/webhooks/webhook.url.validator';
import { ssrfSafeDispatcher } from '@gitroom/nestjs-libraries/dtos/webhooks/ssrf.safe.dispatcher';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fromBuffer } = require('file-type');

const ALLOWED_MIME_TYPES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/bmp',
  'image/tiff',
  'video/mp4',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/ogg',
]);

class S3Storage implements IUploadProvider {
  private _client: S3Client;

  constructor(
    private _region: string,
    private _accessKey: string,
    private _secretKey: string,
    private _bucketName: string,
    private _publicUrl: string,
    private _endpoint?: string
  ) {
    const config: any = {
      region: _region,
      credentials: {
        accessKeyId: _accessKey,
        secretAccessKey: _secretKey,
      },
    };

    // If a custom endpoint is provided (e.g. MinIO, DigitalOcean Spaces),
    // set it and force path-style access.
    if (_endpoint) {
      config.endpoint = _endpoint;
      config.forcePathStyle = true;
    }

    this._client = new S3Client(config);
  }

  async uploadSimple(path: string) {
    if (!(await isSafePublicHttpsUrl(path))) {
      throw new Error('Unsafe URL');
    }
    const loadImage = await fetch(path, {
      // @ts-ignore — undici option, not in lib.dom fetch types
      dispatcher: ssrfSafeDispatcher,
    });
    const body = Buffer.from(await loadImage.arrayBuffer());
    const detected = await fromBuffer(body);
    if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
      throw new Error('Unsupported file type.');
    }
    const extension = detected.ext;
    const safeContentType = detected.mime;
    const id = makeId(10);

    const command = new PutObjectCommand({
      Bucket: this._bucketName,
      Key: `${id}.${extension}`,
      Body: body,
      ContentType: safeContentType,
    });

    await this._client.send(command);

    return `${this._publicUrl}/${id}.${extension}`;
  }

  async uploadFile(file: Express.Multer.File): Promise<any> {
    try {
      const detected = await fromBuffer(file.buffer);
      if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
        throw new Error('Unsupported file type.');
      }
      const id = makeId(10);
      const extension = detected.ext;
      const safeContentType = detected.mime;

      const command = new PutObjectCommand({
        Bucket: this._bucketName,
        Key: `${id}.${extension}`,
        Body: file.buffer,
        ContentType: safeContentType,
      });

      await this._client.send(command);

      return {
        filename: `${id}.${extension}`,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
        originalname: `${id}.${extension}`,
        fieldname: 'file',
        path: `${this._publicUrl}/${id}.${extension}`,
        destination: `${this._publicUrl}/${id}.${extension}`,
        encoding: '7bit',
        stream: file.buffer as any,
      };
    } catch (err) {
      console.error('Error uploading file to AWS S3:', err);
      throw err;
    }
  }

  async removeFile(filePath: string): Promise<void> {
    try {
      const fileName = filePath.split('/').pop();
      if (!fileName) return;

      const command = new DeleteObjectCommand({
        Bucket: this._bucketName,
        Key: fileName,
      });
      await this._client.send(command);
    } catch (err) {
      console.error('Error removing file from AWS S3:', err);
    }
  }
}

export { S3Storage };
export default S3Storage;
