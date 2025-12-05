import multer from "multer";
import path from "path";
import fs from "fs";
import type { Request, RequestHandler } from "express";

// ============================================
// Configuration
// ============================================

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_VIDEO_SIZE = parseInt(process.env.MAX_VIDEO_SIZE || "524288000"); // 500MB default
const MAX_THUMBNAIL_SIZE = parseInt(process.env.MAX_THUMBNAIL_SIZE || "5242880"); // 5MB default

// Allowed file types
const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
];

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

// ============================================
// Ensure Upload Directories Exist
// ============================================

const ensureUploadDirs = () => {
    const videosDir = path.join(UPLOAD_DIR, "videos");
    const thumbnailsDir = path.join(UPLOAD_DIR, "thumbnails");
    const tempDir = path.join(UPLOAD_DIR, "temp");

    [UPLOAD_DIR, videosDir, thumbnailsDir, tempDir].forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

// Initialize directories
ensureUploadDirs();

// ============================================
// Storage Configuration
// ============================================

/**
 * Generate a unique filename for uploads
 */
const generateFilename = (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
};

/**
 * Video storage configuration
 */
const videoStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(UPLOAD_DIR, "videos"));
    },
    filename: generateFilename,
});

/**
 * Thumbnail storage configuration
 */
const thumbnailStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(UPLOAD_DIR, "thumbnails"));
    },
    filename: generateFilename,
});

/**
 * Temp storage for processing
 */
const tempStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(UPLOAD_DIR, "temp"));
    },
    filename: generateFilename,
});

// ============================================
// File Filters
// ============================================

/**
 * Filter for video files
 */
const videoFileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Invalid video type. Allowed types: ${ALLOWED_VIDEO_TYPES.join(", ")}`
            )
        );
    }
};

/**
 * Filter for image files (thumbnails)
 */
const imageFileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`
            )
        );
    }
};

/**
 * Combined filter for video and thumbnail uploads
 */
const videoAndThumbnailFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (file.fieldname === "video") {
        videoFileFilter(req, file, cb);
    } else if (file.fieldname === "thumbnail") {
        imageFileFilter(req, file, cb);
    } else {
        cb(new Error(`Unexpected field: ${file.fieldname}`));
    }
};

// ============================================
// Multer Instances
// ============================================

/**
 * Single video upload middleware
 */
export const uploadVideo: RequestHandler = multer({
    storage: videoStorage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: MAX_VIDEO_SIZE,
        files: 1,
    },
}).single("video");

/**
 * Single thumbnail upload middleware
 */
export const uploadThumbnail: RequestHandler = multer({
    storage: thumbnailStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: MAX_THUMBNAIL_SIZE,
        files: 1,
    },
}).single("thumbnail");

/**
 * Video with thumbnail upload middleware
 */
export const uploadVideoWithThumbnail: RequestHandler = multer({
    storage: tempStorage,
    fileFilter: videoAndThumbnailFilter,
    limits: {
        fileSize: MAX_VIDEO_SIZE,
    },
}).fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]);

/**
 * Channel branding upload middleware (avatar and banner)
 */
export const uploadChannelBranding: RequestHandler = multer({
    storage: thumbnailStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: MAX_THUMBNAIL_SIZE,
    },
}).fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
]);

// ============================================
// Helper Functions
// ============================================

/**
 * Get the full file path for an uploaded video
 */
export const getVideoPath = (filename: string): string => {
    return path.join(UPLOAD_DIR, "videos", filename);
};

/**
 * Get the full file path for an uploaded thumbnail
 */
export const getThumbnailPath = (filename: string): string => {
    return path.join(UPLOAD_DIR, "thumbnails", filename);
};

/**
 * Get the relative URL path for a video
 */
export const getVideoUrl = (filename: string): string => {
    return `/uploads/videos/${filename}`;
};

/**
 * Get the relative URL path for a thumbnail
 */
export const getThumbnailUrl = (filename: string): string => {
    return `/uploads/thumbnails/${filename}`;
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (filePath: string): Promise<void> => {
    try {
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    } catch (error) {
        console.error(`Failed to delete file: ${filePath}`, error);
    }
};

/**
 * Delete a video file by filename
 */
export const deleteVideoFile = async (filename: string): Promise<void> => {
    await deleteFile(getVideoPath(filename));
};

/**
 * Delete a thumbnail file by filename
 */
export const deleteThumbnailFile = async (filename: string): Promise<void> => {
    await deleteFile(getThumbnailPath(filename));
};

/**
 * Move a file from temp to final destination
 */
export const moveFile = async (
    tempPath: string,
    destPath: string
): Promise<void> => {
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    await fs.promises.rename(tempPath, destPath);
};

// ============================================
// Error Handler Middleware
// ============================================

import type { Response, NextFunction } from "express";

/**
 * Handle multer errors with friendly messages
 */
export const handleUploadError = (
    err: Error,
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                return res.status(400).json({
                    error: "File too large",
                    message: `Maximum file size exceeded. Videos: ${MAX_VIDEO_SIZE / 1024 / 1024}MB, Thumbnails: ${MAX_THUMBNAIL_SIZE / 1024 / 1024}MB`,
                });
            case "LIMIT_FILE_COUNT":
                return res.status(400).json({
                    error: "Too many files",
                    message: "Maximum file count exceeded",
                });
            case "LIMIT_UNEXPECTED_FILE":
                return res.status(400).json({
                    error: "Unexpected field",
                    message: `Unexpected field name: ${err.field}`,
                });
            default:
                return res.status(400).json({
                    error: "Upload error",
                    message: err.message,
                });
        }
    }

    if (err.message.includes("Invalid video type") || err.message.includes("Invalid image type")) {
        return res.status(400).json({
            error: "Invalid file type",
            message: err.message,
        });
    }

    next(err);
};

// ============================================
// Exports
// ============================================

export {
    UPLOAD_DIR,
    MAX_VIDEO_SIZE,
    MAX_THUMBNAIL_SIZE,
    ALLOWED_VIDEO_TYPES,
    ALLOWED_IMAGE_TYPES,
};
