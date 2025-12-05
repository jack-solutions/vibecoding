import fs from "fs";
import path from "path";

// ============================================
// Storage Interface & Types
// ============================================

export interface StorageProvider {
    upload(file: Buffer | string, key: string, options?: UploadOptions): Promise<UploadResult>;
    download(key: string): Promise<Buffer>;
    delete(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    getUrl(key: string): string;
    getMetadata(key: string): Promise<FileMetadata | null>;
}

export interface UploadOptions {
    contentType?: string;
    metadata?: Record<string, string>;
    public?: boolean;
}

export interface UploadResult {
    key: string;
    url: string;
    size: number;
}

export interface FileMetadata {
    key: string;
    size: number;
    contentType?: string;
    lastModified?: Date;
}

// ============================================
// Local Storage Provider (Development)
// ============================================

const LOCAL_STORAGE_DIR = process.env.LOCAL_STORAGE_DIR || "./uploads";
const LOCAL_STORAGE_URL_PREFIX = process.env.LOCAL_STORAGE_URL_PREFIX || "/uploads";

export class LocalStorageProvider implements StorageProvider {
    private baseDir: string;
    private urlPrefix: string;

    constructor(baseDir?: string, urlPrefix?: string) {
        this.baseDir = baseDir || LOCAL_STORAGE_DIR;
        this.urlPrefix = urlPrefix || LOCAL_STORAGE_URL_PREFIX;
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
    }

    async upload(file: Buffer | string, key: string): Promise<UploadResult> {
        const filePath = path.join(this.baseDir, key);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (typeof file === "string") {
            await fs.promises.copyFile(file, filePath);
        } else {
            await fs.promises.writeFile(filePath, file);
        }
        const stats = await fs.promises.stat(filePath);
        return { key, url: this.getUrl(key), size: stats.size };
    }

    async download(key: string): Promise<Buffer> {
        const filePath = path.join(this.baseDir, key);
        if (!fs.existsSync(filePath)) throw new Error(`File not found: ${key}`);
        return fs.promises.readFile(filePath);
    }

    async delete(key: string): Promise<void> {
        const filePath = path.join(this.baseDir, key);
        if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
    }

    async exists(key: string): Promise<boolean> {
        return fs.existsSync(path.join(this.baseDir, key));
    }

    getUrl(key: string): string {
        return `${this.urlPrefix}/${key}`;
    }

    async getMetadata(key: string): Promise<FileMetadata | null> {
        const filePath = path.join(this.baseDir, key);
        if (!fs.existsSync(filePath)) return null;
        const stats = await fs.promises.stat(filePath);
        return { key, size: stats.size, lastModified: stats.mtime };
    }
}

// ============================================
// Storage Factory & Helpers
// ============================================

export type StorageType = "local" | "s3" | "cloudinary";

export function createStorageProvider(type?: StorageType): StorageProvider {
    const storageType = type || (process.env.STORAGE_TYPE as StorageType) || "local";
    // For now, only local is implemented
    return new LocalStorageProvider();
}

export const storage = createStorageProvider();

export function generateVideoKey(channelId: string, filename: string): string {
    const ext = path.extname(filename);
    return `videos/${channelId}/${Date.now()}${ext}`;
}

export function generateThumbnailKey(channelId: string, filename: string): string {
    const ext = path.extname(filename);
    return `thumbnails/${channelId}/${Date.now()}${ext}`;
}

export function getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const types: Record<string, string> = {
        ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
    };
    return types[ext] || "application/octet-stream";
}
