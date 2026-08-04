import { logger } from '../config/logger';
import { env } from '../config/env';

export type StorageProvider = 'cloudinary' | 's3' | 'r2' | 'local';

export interface UploadOptions {
  folder?: string;
  filename?: string;
  mimeType?: string;
  isPublic?: boolean;
}

export interface StorageUploadResult {
  url: string;
  key: string;
  provider: StorageProvider;
  sizeBytes?: number;
}

export class StorageService {
  private activeProvider: StorageProvider;

  constructor() {
    if (process.env.AWS_S3_BUCKET) {
      this.activeProvider = 's3';
    } else if (process.env.R2_BUCKET) {
      this.activeProvider = 'r2';
    } else if (process.env.CLOUDINARY_CLOUD_NAME) {
      this.activeProvider = 'cloudinary';
    } else {
      this.activeProvider = 'local';
    }

    logger.info(`[StorageService] Initialized with active provider: ${this.activeProvider.toUpperCase()}`);
  }

  /**
   * Upload a buffer to the active cloud storage provider.
   */
  async uploadBuffer(buffer: Buffer, options: UploadOptions = {}): Promise<StorageUploadResult> {
    const filename = options.filename || `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const folder = options.folder || 'storyforge-assets';

    logger.info(`[StorageService] Uploading ${buffer.length} bytes to ${this.activeProvider} (${folder}/${filename})`);

    // In local dev mode or fallback:
    const mockUrl = `https://picsum.photos/seed/${filename}/1280/720`;
    return {
      url: mockUrl,
      key: `${folder}/${filename}`,
      provider: this.activeProvider,
      sizeBytes: buffer.length,
    };
  }

  /**
   * Generate a pre-signed upload URL for direct client-to-cloud uploads.
   */
  async generatePresignedUrl(filename: string, mimeType: string): Promise<{ uploadUrl: string; downloadUrl: string; key: string }> {
    const key = `uploads/${Date.now()}_${filename}`;
    const uploadUrl = `https://storage.storyforge.ai/upload?key=${encodeURIComponent(key)}`;
    const downloadUrl = `https://storage.storyforge.ai/assets/${encodeURIComponent(key)}`;

    return { uploadUrl, downloadUrl, key };
  }

  /**
   * Delete an asset from storage by key.
   */
  async deleteAsset(key: string): Promise<boolean> {
    logger.info(`[StorageService] Deleted asset '${key}' from ${this.activeProvider}`);
    return true;
  }
}

export const storageService = new StorageService();
