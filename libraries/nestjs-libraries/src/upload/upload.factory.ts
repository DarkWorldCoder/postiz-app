import { CloudflareStorage } from './cloudflare.storage';
import { S3Storage } from './s3.storage';
import { IUploadProvider } from './upload.interface';
import { LocalStorage } from './local.storage';

export class UploadFactory {
  static getBucketUrl(): string {
    if (process.env.STORAGE_PROVIDER === 's3') {
      return process.env.S3_BUCKET_URL || '';
    }
    return process.env.CLOUDFLARE_BUCKET_URL || '';
  }

  static createStorage(): IUploadProvider {
    const storageProvider = process.env.STORAGE_PROVIDER || 'local';

    switch (storageProvider) {
      case 'local':
        return new LocalStorage(process.env.UPLOAD_DIRECTORY!);
      case 'cloudflare':
        return new CloudflareStorage(
          process.env.CLOUDFLARE_ACCOUNT_ID!,
          process.env.CLOUDFLARE_ACCESS_KEY!,
          process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
          process.env.CLOUDFLARE_REGION!,
          process.env.CLOUDFLARE_BUCKETNAME!,
          process.env.CLOUDFLARE_BUCKET_URL!
        );
      case 's3':
        return new S3Storage(
          process.env.S3_REGION!,
          process.env.S3_ACCESS_KEY!,
          process.env.S3_SECRET_ACCESS_KEY!,
          process.env.S3_BUCKETNAME!,
          process.env.S3_BUCKET_URL!,
          process.env.S3_ENDPOINT || undefined
        );
      default:
        throw new Error(`Invalid storage type ${storageProvider}`);
    }
  }
}
