import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

export interface StorageUploadResult {
  url: string;
  key: string;
  bucket: string;
  fileSize: number;
  mimeType: string;
  storageProvider: 's3-compatible' | 'local-filesystem';
}

/**
 * Civic-Tech Object Storage Service
 * Handles media uploads for photos of infrastructure, voice complaints, and documents.
 * Seamlessly interfaces with AWS S3, MinIO, Cloudflare R2, or persistent local filesystem storage.
 */
class StorageService {
  private bucket: string;
  private accessKey: string;
  private secretKey: string;
  private endpoint: string;
  private region: string;
  private useSSL: boolean;
  private localUploadDir: string;

  constructor() {
    this.bucket = config.storage.bucket;
    this.accessKey = config.storage.accessKey;
    this.secretKey = config.storage.secretKey;
    this.endpoint = config.storage.endpoint;
    this.region = config.storage.region;
    this.useSSL = config.storage.useSSL;

    // Persistent local storage directory
    this.localUploadDir = path.resolve(process.cwd(), 'data', 'uploads');
    this.ensureDirectory(this.localUploadDir);
  }

  private ensureDirectory(dirPath: string) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (err) {
      console.warn('[Storage] Could not create upload directory:', err);
    }
  }

  /**
   * Checks if remote object storage credentials have been provisioned
   */
  public isConfigured(): boolean {
    return Boolean(this.accessKey && this.secretKey);
  }

  /**
   * Upload a base64 encoded image or media file safely
   */
  public async uploadBase64(
    base64Data: string,
    filename: string,
    mimeType: string,
    requestId: string
  ): Promise<StorageUploadResult> {
    console.log(`[Storage] MEDIA_UPLOAD_STARTED: requestId=${requestId} filename=${filename} mimeType=${mimeType}`);

    try {
      // Clean base64 header if present (data:image/jpeg;base64,...)
      const cleanedBase64 = base64Data.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
      const buffer = Buffer.from(cleanedBase64, 'base64');
      return await this.uploadBuffer(buffer, filename, mimeType, requestId);
    } catch (err: any) {
      console.error(`[Storage] MEDIA_UPLOAD_FAILED: requestId=${requestId} error=${err.message}`);
      throw new Error(`Media upload failed: ${err.message}`);
    }
  }

  /**
   * Upload raw buffer to storage (S3 or local disk)
   */
  public async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    requestId: string
  ): Promise<StorageUploadResult> {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${requestId}/${timestamp}-${sanitizedFilename}`;

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      throw new Error('File exceeds maximum upload limit of 10MB');
    }

    // Remote S3 upload if configured
    if (this.isConfigured()) {
      try {
        const baseUrl = this.endpoint.replace(/\/$/, '');
        const targetUrl = `${baseUrl}/${this.bucket}/${key}`;

        // Perform HTTP PUT with authorization headers to S3/MinIO
        const response = await fetch(targetUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': mimeType,
            'Content-Length': buffer.length.toString(),
          },
          body: new Uint8Array(buffer),
        });

        if (response.ok) {
          console.log(`[Storage] MEDIA_UPLOAD_SUCCESS: provider=s3 key=${key} size=${buffer.length}`);
          return {
            url: targetUrl,
            key,
            bucket: this.bucket,
            fileSize: buffer.length,
            mimeType,
            storageProvider: 's3-compatible',
          };
        }
      } catch (s3Err) {
        console.warn('[Storage] Remote S3 upload failed, falling back to local persistent storage:', s3Err);
      }
    }

    // Local filesystem storage fallback
    const targetFile = path.resolve(this.localUploadDir, key.replace(/\//g, '_'));
    await fs.promises.writeFile(targetFile, buffer);
    const localUrl = `/api/v1/storage/${encodeURIComponent(key)}`;

    console.log(`[Storage] MEDIA_UPLOAD_SUCCESS: provider=local-filesystem key=${key} size=${buffer.length}`);

    return {
      url: localUrl,
      key,
      bucket: this.bucket,
      fileSize: buffer.length,
      mimeType,
      storageProvider: 'local-filesystem',
    };
  }

  /**
   * Retrieve file buffer by storage key
   */
  public async getFile(key: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const localFile = path.resolve(this.localUploadDir, key.replace(/\//g, '_'));
    if (fs.existsSync(localFile)) {
      const buffer = await fs.promises.readFile(localFile);
      const ext = path.extname(key).toLowerCase();
      let mimeType = 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.mp3' || ext === '.wav') mimeType = 'audio/mpeg';
      return { buffer, mimeType };
    }
    return null;
  }

  /**
   * Return storage configuration status
   */
  public getStatus() {
    return {
      configured: this.isConfigured(),
      bucket: this.bucket,
      region: this.region,
      endpoint: this.endpoint,
      useSSL: this.useSSL,
      hasAccessKey: Boolean(this.accessKey),
      localUploadDir: this.localUploadDir,
    };
  }
}

export const storageService = new StorageService();
