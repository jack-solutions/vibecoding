import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { z } from "zod";
import { getAuthContext, requireAuth } from "@vc-yt-clone/auth";
import {
    // Comment functions
    createComment,
    getCommentById,
    updateComment,
    deleteComment,
    getVideoComments,
    getCommentReplies,
    pinComment,
    unpinComment,
    isCommentOwner,
    getCommentVideoOwner,
    // Like functions
    likeVideo,
    dislikeVideo,
    removeLike,
    getUserLikeStatus,
    getUserLikedVideos,
    // Subscription functions
    subscribe,
    unsubscribe,
    getSubscriptionStatus,
    getUserSubscriptions,
    updateNotificationPreference,
    // Other functions
    getVideoById,
    getChannelById,
} from "@vc-yt-clone/db";

const router: ExpressRouter = Router();

// ============================================
// Validation Schemas
// ============================================

const createCommentSchema = z.object({
    videoId: z.string().min(1),
    content: z.string().min(1).max(10000),
    parentCommentId: z.string().optional(),
});

const updateCommentSchema = z.object({
    content: z.string().min(1).max(10000),
});

// ============================================
// Comment Routes
// ============================================

/**
 * POST /api/engagement/comment
 * Create a new comment
 */
router.post("/comment", requireAuth, async (req, res) => {
    try {
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        const validation = createCommentSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: "Invalid input", details: validation.error.issues });
            return;
        }

        const { videoId, content, parentCommentId } = validation.data;

        // Verify video exists and is accessible
        const video = await getVideoById(videoId);
        if (!video || video.visibility !== "PUBLIC") {
            res.status(404).json({ error: "Video not found" });
            return;
        }

        // If replying, verify parent comment exists
        if (parentCommentId) {
            const parentComment = await getCommentById(parentCommentId);
            if (!parentComment || parentComment.videoId !== videoId) {
                res.status(400).json({ error: "Invalid parent comment" });
                return;
            }
        }

        const comment = await createComment({
            videoId,
            userProfileId: context.user.profile.id,
            content,
            parentCommentId,
        });

        res.status(201).json({ message: "Comment created", comment });
    } catch (error) {
        console.error("Create comment error:", error);
        res.status(500).json({ error: "Failed to create comment" });
    }
});

/**
 * GET /api/engagement/comment/video/:videoId
 * Get comments for a video
 */
router.get("/comment/video/:videoId", async (req, res) => {
    try {
        const videoId = req.params.videoId!;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;
        const sort = (req.query.sort as string) || "newest";

        // Verify video exists and is accessible
        const video = await getVideoById(videoId);
        if (!video || video.visibility !== "PUBLIC") {
            res.status(404).json({ error: "Video not found" });
            return;
        }

        const result = await getVideoComments(videoId, {
            limit,
            offset,
            sortBy: sort as "newest" | "oldest" | "popular",
        });

        res.json(result);
    } catch (error) {
        console.error("Get comments error:", error);
        res.status(500).json({ error: "Failed to get comments" });
    }
});

/**
 * GET /api/engagement/comment/:commentId/replies
 * Get replies to a comment
 */
router.get("/comment/:commentId/replies", async (req, res) => {
    try {
        const commentId = req.params.commentId!;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;
        const sort = (req.query.sort as string) || "oldest";

        const comment = await getCommentById(commentId);
        if (!comment) {
            res.status(404).json({ error: "Comment not found" });
            return;
        }

        const result = await getCommentReplies(commentId, {
            limit,
            offset,
            sortBy: sort as "newest" | "oldest" | "popular",
        });

        res.json(result);
    } catch (error) {
        console.error("Get replies error:", error);
        res.status(500).json({ error: "Failed to get replies" });
    }
});

/**
 * PATCH /api/engagement/comment/:commentId
 * Update a comment
 */
router.patch("/comment/:commentId", requireAuth, async (req, res) => {
    try {
        const commentId = req.params.commentId!;
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        const validation = updateCommentSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ error: "Invalid input", details: validation.error.issues });
            return;
        }

        // Check ownership
        const isOwner = await isCommentOwner(commentId, context.user.profile.id);
        if (!isOwner) {
            res.status(403).json({ error: "Not authorized" });
            return;
        }

        const comment = await updateComment(commentId, validation.data);
        res.json({ message: "Comment updated", comment });
    } catch (error) {
        console.error("Update comment error:", error);
        res.status(500).json({ error: "Failed to update comment" });
    }
});

/**
 * DELETE /api/engagement/comment/:commentId
 * Delete a comment
 */
router.delete("/comment/:commentId", requireAuth, async (req, res) => {
    try {
        const commentId = req.params.commentId!;
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        // Check if user is comment owner or video owner
        const isOwner = await isCommentOwner(commentId, context.user.profile.id);
        const videoOwner = await getCommentVideoOwner(commentId);
        const isVideoOwner = videoOwner === context.user.profile.id;

        if (!isOwner && !isVideoOwner) {
            res.status(403).json({ error: "Not authorized" });
            return;
        }

        await deleteComment(commentId);
        res.json({ message: "Comment deleted" });
    } catch (error) {
        console.error("Delete comment error:", error);
        res.status(500).json({ error: "Failed to delete comment" });
    }
});

/**
 * POST /api/engagement/comment/:commentId/pin
 * Pin a comment (video owner only)
 */
router.post("/comment/:commentId/pin", requireAuth, async (req, res) => {
    try {
        const commentId = req.params.commentId!;
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        // Only video owner can pin
        const videoOwner = await getCommentVideoOwner(commentId);
        if (videoOwner !== context.user.profile.id) {
            res.status(403).json({ error: "Only video owner can pin comments" });
            return;
        }

        const comment = await pinComment(commentId);
        res.json({ message: "Comment pinned", comment });
    } catch (error) {
        console.error("Pin comment error:", error);
        res.status(500).json({ error: "Failed to pin comment" });
    }
});

/**
 * DELETE /api/engagement/comment/:commentId/pin
 * Unpin a comment (video owner only)
 */
router.delete("/comment/:commentId/pin", requireAuth, async (req, res) => {
    try {
        const commentId = req.params.commentId!;
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        // Only video owner can unpin
        const videoOwner = await getCommentVideoOwner(commentId);
        if (videoOwner !== context.user.profile.id) {
            res.status(403).json({ error: "Only video owner can unpin comments" });
            return;
        }

        const comment = await unpinComment(commentId);
        res.json({ message: "Comment unpinned", comment });
    } catch (error) {
        console.error("Unpin comment error:", error);
        res.status(500).json({ error: "Failed to unpin comment" });
    }
});

// ============================================
// Like Routes
// ============================================

/**
 * POST /api/engagement/like/:videoId
 * Like a video
 */
router.post("/like/:videoId", requireAuth, async (req, res) => {
    try {
        const videoId = req.params.videoId!;
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        // Verify video exists
        const video = await getVideoById(videoId);
        if (!video || video.visibility !== "PUBLIC") {
            res.status(404).json({ error: "Video not found" });
            return;
        }

        const result = await likeVideo(context.user.profile.id, videoId);
        res.json({ message: "Video liked", action: result.action });
    } catch (error) {
        console.error("Like video error:", error);
        res.status(500).json({ error: "Failed to like video" });
    }
});

/**
 * POST /api/engagement/dislike/:videoId
 * Dislike a video
 */
router.post("/dislike/:videoId", requireAuth, async (req, res) => {
    try {
        const videoId = req.params.videoId!;
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        // Verify video exists
        const video = await getVideoById(videoId);
        if (!video || video.visibility !== "PUBLIC") {
            res.status(404).json({ error: "Video not found" });
            return;
        }

        const result = await dislikeVideo(context.user.profile.id, videoId);
        res.json({ message: "Video disliked", action: result.action });
    } catch (error) {
        console.error("Dislike video error:", error);
        res.status(500).json({ error: "Failed to dislike video" });
    }
});

/**
 * DELETE /api/engagement/like/:videoId
 * Remove like/dislike from a video
 */
router.delete("/like/:videoId", requireAuth, async (req, res) => {
    try {
        const videoId = req.params.videoId!;
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        const result = await removeLike(context.user.profile.id, videoId);
        res.json({ message: "Like removed", action: result.action });
    } catch (error) {
        console.error("Remove like error:", error);
        res.status(500).json({ error: "Failed to remove like" });
    }
});

/**
 * GET /api/engagement/like/:videoId/status
 * Get user's like status for a video
 */
router.get("/like/:videoId/status", requireAuth, async (req, res) => {
    try {
        const videoId = req.params.videoId!;
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        const status = await getUserLikeStatus(context.user.profile.id, videoId);
        res.json(status);
    } catch (error) {
        console.error("Get like status error:", error);
        res.status(500).json({ error: "Failed to get like status" });
    }
});

/**
 * GET /api/engagement/liked-videos
 * Get user's liked videos
 */
router.get("/liked-videos", requireAuth, async (req, res) => {
    try {
        const context = getAuthContext(req);
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        const result = await getUserLikedVideos(context.user.profile.id, limit, offset);
        res.json(result);
    } catch (error) {
        console.error("Get liked videos error:", error);
        res.status(500).json({ error: "Failed to get liked videos" });
    }
});

// ============================================
// Subscription Routes
// ============================================

/**
 * POST /api/engagement/subscribe/:channelId
 * Subscribe to a channel
 */
router.post("/subscribe/:channelId", requireAuth, async (req, res) => {
    try {
        const channelId = req.params.channelId!;
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        // Verify channel exists
        const channel = await getChannelById(channelId);
        if (!channel) {
            res.status(404).json({ error: "Channel not found" });
            return;
        }

        const result = await subscribe(context.user.profile.id, channelId);
        res.json({ message: "Subscribed to channel", action: result.action });
    } catch (error: any) {
        if (error.message === "Cannot subscribe to your own channel") {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error("Subscribe error:", error);
        res.status(500).json({ error: "Failed to subscribe" });
    }
});

/**
 * DELETE /api/engagement/subscribe/:channelId
 * Unsubscribe from a channel
 */
router.delete("/subscribe/:channelId", requireAuth, async (req, res) => {
    try {
        const channelId = req.params.channelId!;
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        const result = await unsubscribe(context.user.profile.id, channelId);
        res.json({ message: "Unsubscribed from channel", action: result.action });
    } catch (error) {
        console.error("Unsubscribe error:", error);
        res.status(500).json({ error: "Failed to unsubscribe" });
    }
});

/**
 * GET /api/engagement/subscribe/:channelId/status
 * Get subscription status for a channel
 */
router.get("/subscribe/:channelId/status", requireAuth, async (req, res) => {
    try {
        const channelId = req.params.channelId!;
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        const status = await getSubscriptionStatus(context.user.profile.id, channelId);
        res.json(status);
    } catch (error) {
        console.error("Get subscription status error:", error);
        res.status(500).json({ error: "Failed to get subscription status" });
    }
});

/**
 * PATCH /api/engagement/subscribe/:channelId/notifications
 * Update notification preference for a subscription
 */
router.patch("/subscribe/:channelId/notifications", requireAuth, async (req, res) => {
    try {
        const channelId = req.params.channelId!;
        const context = getAuthContext(req);
        const { enabled } = req.body;

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        if (typeof enabled !== "boolean") {
            res.status(400).json({ error: "enabled must be a boolean" });
            return;
        }

        const subscription = await updateNotificationPreference(
            context.user.profile.id,
            channelId,
            enabled
        );

        res.json({ message: "Notification preference updated", subscription });
    } catch (error: any) {
        if (error.message === "Not subscribed to this channel") {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error("Update notifications error:", error);
        res.status(500).json({ error: "Failed to update notification preference" });
    }
});

/**
 * GET /api/engagement/subscriptions
 * Get user's subscriptions
 */
router.get("/subscriptions", requireAuth, async (req, res) => {
    try {
        const context = getAuthContext(req);
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        if (!context.user.profile?.id) {
            res.status(400).json({ error: "User profile required" });
            return;
        }

        const result = await getUserSubscriptions(context.user.profile.id, limit, offset);
        res.json(result);
    } catch (error) {
        console.error("Get subscriptions error:", error);
        res.status(500).json({ error: "Failed to get subscriptions" });
    }
});

export default router;
