import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { z } from "zod";
import { getAuthContext, requireCreator } from "@vc-yt-clone/auth";
import {
    createVideo,
    updateVideo,
    deleteVideo,
    getVideoById,
    getChannelByUserId,
    getVideosByChannelId,
    recordView,
    searchVideos,
    getTrendingVideos,
    getRelatedVideos,
    getCategories,
} from "@vc-yt-clone/db";
import {
    uploadVideo,
    uploadThumbnail,
    handleUploadError,
    getVideoUrl,
    getThumbnailUrl,
    deleteVideoFile,
    deleteThumbnailFile,
} from "../middleware/upload";

const router: ExpressRouter = Router();

// ============================================
// Validation Schemas
// ============================================

const createVideoSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(5000).optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
    category: z.string().max(50).optional(),
    tags: z.array(z.string().max(30)).max(20).optional(),
});

const updateVideoSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(5000).optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
    category: z.string().max(50).optional(),
    tags: z.array(z.string().max(30)).max(20).optional(),
});

// ============================================
// Routes
// ============================================

/**
 * GET /api/video/trending
 * Get trending videos (must be before /:id routes)
 */
router.get("/trending", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const videos = await getTrendingVideos(limit);
        res.json({ videos });
    } catch (error) {
        console.error("Trending error:", error);
        res.status(500).json({ error: "Failed to get trending videos" });
    }
});

/**
 * GET /api/video/search
 * Search videos
 */
router.get("/search", async (req, res) => {
    try {
        const q = req.query.q as string;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;
        const category = req.query.category as string;
        const sort = (req.query.sort as string) || "relevance";

        if (!q) {
            res.status(400).json({ error: "Search query required" });
            return;
        }

        const result = await searchVideos(q, {
            limit,
            offset,
            category,
            sortBy: sort as "relevance" | "date" | "views",
        });

        res.json(result);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

/**
 * GET /api/video/categories
 * Get video categories
 */
router.get("/categories", async (_req, res) => {
    try {
        const categories = await getCategories();
        res.json({ categories });
    } catch (error) {
        console.error("Categories error:", error);
        res.status(500).json({ error: "Failed to get categories" });
    }
});

/**
 * POST /api/video/upload
 * Upload a new video file (requires creator role)
 */
router.post(
    "/upload",
    requireCreator,
    (req, res, next) => {
        uploadVideo(req, res, (err) => {
            if (err) return handleUploadError(err, req, res, next);
            next();
        });
    },
    async (req, res) => {
        try {
            const context = getAuthContext(req);

            // Get the user's channel
            const channel = await getChannelByUserId(context.user.id);
            if (!channel) {
                res.status(400).json({ error: "You must create a channel first" });
                return;
            }

            if (!req.file) {
                res.status(400).json({ error: "No video file provided" });
                return;
            }

            const videoUrl = getVideoUrl(req.file.filename);

            // Create video record with pending status
            const video = await createVideo({
                channelId: channel.id,
                title: req.file.originalname.replace(/\.[^/.]+$/, ""),
                videoUrl,
                visibility: "PRIVATE",
            });

            res.status(201).json({
                message: "Video uploaded successfully",
                video: {
                    id: video.id,
                    title: video.title,
                    videoUrl: video.videoUrl,
                    processStatus: video.processStatus,
                },
            });
        } catch (error) {
            console.error("Video upload error:", error);
            res.status(500).json({ error: "Failed to upload video" });
        }
    }
);

/**
 * POST /api/video/:id/metadata
 * Set video metadata after upload
 */
router.post("/:id/metadata", requireCreator, async (req, res) => {
    try {
        const id = req.params.id!;
        const context = getAuthContext(req);

        const video = await getVideoById(id);
        if (!video) {
            res.status(404).json({ error: "Video not found" });
            return;
        }

        // Check ownership via channel's userProfile
        if (video.channel.userProfile.userId !== context.user.id) {
            res.status(403).json({ error: "Not authorized" });
            return;
        }

        const validation = createVideoSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: "Invalid input", details: validation.error.issues });
            return;
        }

        const { title, description, visibility, category, tags } = validation.data;
        const updated = await updateVideo(id, { title, description, visibility, category, tags });

        res.json({ message: "Video metadata updated", video: updated });
    } catch (error) {
        console.error("Video metadata error:", error);
        res.status(500).json({ error: "Failed to update video metadata" });
    }
});

/**
 * POST /api/video/:id/thumbnail
 * Upload video thumbnail
 */
router.post(
    "/:id/thumbnail",
    requireCreator,
    (req, res, next) => {
        uploadThumbnail(req, res, (err) => {
            if (err) return handleUploadError(err, req, res, next);
            next();
        });
    },
    async (req, res) => {
        try {
            const id = req.params.id!;
            const context = getAuthContext(req);

            const video = await getVideoById(id);
            if (!video) {
                res.status(404).json({ error: "Video not found" });
                return;
            }

            if (video.channel.userProfile.userId !== context.user.id) {
                res.status(403).json({ error: "Not authorized" });
                return;
            }

            if (!req.file) {
                res.status(400).json({ error: "No thumbnail provided" });
                return;
            }

            const thumbnailUrl = getThumbnailUrl(req.file.filename);
            await updateVideo(id, { thumbnailUrl } as any);

            res.json({ message: "Thumbnail uploaded", thumbnailUrl });
        } catch (error) {
            console.error("Thumbnail upload error:", error);
            res.status(500).json({ error: "Failed to upload thumbnail" });
        }
    }
);

/**
 * GET /api/video/channel/:channelId
 * Get videos for a channel
 */
router.get("/channel/:channelId", async (req, res) => {
    try {
        const channelId = req.params.channelId!
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const result = await getVideosByChannelId(channelId, { limit, offset });
        res.json(result);
    } catch (error) {
        console.error("Get channel videos error:", error);
        res.status(500).json({ error: "Failed to get videos" });
    }
});

/**
 * GET /api/video/:id
 * Get video details
 */
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id!;
        const video = await getVideoById(id);

        if (!video) {
            res.status(404).json({ error: "Video not found" });
            return;
        }

        // Only show public videos to non-owners
        if (video.visibility !== "PUBLIC") {
            try {
                const context = getAuthContext(req);
                if (video.channel.userProfile.userId !== context.user.id) {
                    res.status(404).json({ error: "Video not found" });
                    return;
                }
            } catch {
                res.status(404).json({ error: "Video not found" });
                return;
            }
        }

        res.json({ video });
    } catch (error) {
        console.error("Get video error:", error);
        res.status(500).json({ error: "Failed to get video" });
    }
});

/**
 * GET /api/video/:id/related
 * Get related videos
 */
router.get("/:id/related", async (req, res) => {
    try {
        const id = req.params.id!;
        const limit = parseInt(req.query.limit as string) || 10;
        const videos = await getRelatedVideos(id, limit);
        res.json({ videos });
    } catch (error) {
        console.error("Related videos error:", error);
        res.status(500).json({ error: "Failed to get related videos" });
    }
});

/**
 * PATCH /api/video/:id
 * Update video details
 */
router.patch("/:id", requireCreator, async (req, res) => {
    try {
        const id = req.params.id!;
        const context = getAuthContext(req);

        const video = await getVideoById(id);
        if (!video) {
            res.status(404).json({ error: "Video not found" });
            return;
        }

        if (video.channel.userProfile.userId !== context.user.id) {
            res.status(403).json({ error: "Not authorized" });
            return;
        }

        const validation = updateVideoSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: "Invalid input", details: validation.error.issues });
            return;
        }

        const updated = await updateVideo(id, validation.data);
        res.json({ message: "Video updated", video: updated });
    } catch (error) {
        console.error("Update video error:", error);
        res.status(500).json({ error: "Failed to update video" });
    }
});

/**
 * DELETE /api/video/:id
 * Delete a video
 */
router.delete("/:id", requireCreator, async (req, res) => {
    try {
        const id = req.params.id!;
        const context = getAuthContext(req);

        const video = await getVideoById(id);
        if (!video) {
            res.status(404).json({ error: "Video not found" });
            return;
        }

        if (video.channel.userProfile.userId !== context.user.id) {
            res.status(403).json({ error: "Not authorized" });
            return;
        }

        // Delete files
        if (video.videoUrl) {
            const filename = video.videoUrl.split("/").pop();
            if (filename) await deleteVideoFile(filename);
        }
        if (video.thumbnailUrl) {
            const filename = video.thumbnailUrl.split("/").pop();
            if (filename) await deleteThumbnailFile(filename);
        }

        await deleteVideo(id);
        res.json({ message: "Video deleted" });
    } catch (error) {
        console.error("Delete video error:", error);
        res.status(500).json({ error: "Failed to delete video" });
    }
});

/**
 * POST /api/video/:id/view
 * Record a video view
 */
router.post("/:id/view", async (req, res) => {
    try {
        const id = req.params.id!;
        const { watchDuration, watchPercentage } = req.body;

        const video = await getVideoById(id);
        if (!video || video.visibility !== "PUBLIC") {
            res.status(404).json({ error: "Video not found" });
            return;
        }

        let userProfileId: string | undefined;
        try {
            const context = getAuthContext(req);
            userProfileId = context.user.profile?.id;
        } catch {
            // Anonymous view
        }

        await recordView(id, {
            userProfileId,
            watchDuration,
            watchPercentage,
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });

        res.json({ message: "View recorded" });
    } catch (error) {
        console.error("Record view error:", error);
        res.status(500).json({ error: "Failed to record view" });
    }
});

export default router;
