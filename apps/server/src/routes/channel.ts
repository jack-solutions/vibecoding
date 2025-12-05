import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import type { VideoVisibility } from "@vc-yt-clone/db";
import {
    getChannelById,
    getChannelByHandle,
    createChannel,
    updateChannel,
    deleteChannel,
    isHandleAvailable,
    getChannelVideos,
    subscribe,
    unsubscribe,
    isSubscribed,
    getChannelOwnerId,
} from "@vc-yt-clone/db";
import {
    getAuthContext,
    requireViewer,
    requireCreator,
    requireOwnershipOrAdmin,
} from "@vc-yt-clone/auth";

const router: ExpressRouter = Router();

// ============================================
// Public Channel Routes
// ============================================

/**
 * GET /api/channel/:id
 * Get channel details by ID or handle
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Try to find by ID first, then by handle
        let channel = await getChannelById(id);

        if (!channel) {
            channel = await getChannelByHandle(id);
        }

        if (!channel) {
            res.status(404).json({
                error: "Not Found",
                message: "Channel not found",
            });
            return;
        }

        // Check if user is subscribed (if authenticated)
        let isUserSubscribed = false;
        try {
            const context = getAuthContext(req);
            if (context?.user?.profile?.id) {
                isUserSubscribed = await isSubscribed(context.user.profile.id, channel.id);
            }
        } catch {
            // User not authenticated, that's fine
        }

        res.json({
            success: true,
            data: {
                ...channel,
                isSubscribed: isUserSubscribed,
            },
        });
    } catch (error) {
        console.error("Get channel error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to get channel",
        });
    }
});

/**
 * GET /api/channel/:id/videos
 * Get videos for a channel
 */
router.get("/:id/videos", async (req, res) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;
        const sortBy = (req.query.sort as "newest" | "oldest" | "popular") || "newest";

        // Find channel
        let channel = await getChannelById(id);
        if (!channel) {
            channel = await getChannelByHandle(id);
        }

        if (!channel) {
            res.status(404).json({
                error: "Not Found",
                message: "Channel not found",
            });
            return;
        }

        // Check if user is owner (to show private videos)
        let showPrivate = false;
        try {
            const context = getAuthContext(req);
            if (context?.user?.profile?.id === channel.userProfile.id) {
                showPrivate = true;
            }
        } catch {
            // Not authenticated
        }

        const visibility: VideoVisibility | undefined = showPrivate ? undefined : "PUBLIC";
        const result = await getChannelVideos(channel.id, {
            limit,
            offset,
            visibility,
            sortBy,
        });

        res.json({
            success: true,
            data: result.videos,
            meta: {
                total: result.total,
                limit,
                offset,
            },
        });
    } catch (error) {
        console.error("Get channel videos error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to get channel videos",
        });
    }
});

/**
 * GET /api/channel/check-handle/:handle
 * Check if a handle is available
 */
router.get("/check-handle/:handle", async (req, res) => {
    try {
        const { handle } = req.params;
        const available = await isHandleAvailable(handle);

        res.json({
            success: true,
            data: { available },
        });
    } catch (error) {
        console.error("Check handle error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to check handle availability",
        });
    }
});

// ============================================
// Protected Channel Routes
// ============================================

/**
 * POST /api/channel
 * Create a new channel (requires CREATOR role)
 */
router.post("/", requireCreator, async (req, res) => {
    try {
        const context = getAuthContext(req);
        const { name, handle, description, avatar, banner } = req.body;

        // Validate required fields
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            res.status(400).json({
                error: "Bad Request",
                message: "Channel name is required",
            });
            return;
        }

        if (!handle || typeof handle !== "string" || handle.trim().length === 0) {
            res.status(400).json({
                error: "Bad Request",
                message: "Channel handle is required",
            });
            return;
        }

        // Validate handle format
        const handleRegex = /^[a-zA-Z0-9_-]+$/;
        if (!handleRegex.test(handle)) {
            res.status(400).json({
                error: "Bad Request",
                message: "Handle can only contain letters, numbers, underscores, and hyphens",
            });
            return;
        }

        if (handle.length < 3 || handle.length > 30) {
            res.status(400).json({
                error: "Bad Request",
                message: "Handle must be between 3 and 30 characters",
            });
            return;
        }

        if (!context.user.profile?.id) {
            res.status(400).json({
                error: "Bad Request",
                message: "User profile not found",
            });
            return;
        }

        const channel = await createChannel({
            userProfileId: context.user.profile.id,
            name: name.trim(),
            handle: handle.trim(),
            description: description?.trim(),
            avatar,
            banner,
        });

        res.status(201).json({
            success: true,
            data: channel,
            message: "Channel created successfully",
        });
    } catch (error: any) {
        console.error("Create channel error:", error);

        if (error.message === "Channel handle already taken") {
            res.status(409).json({
                error: "Conflict",
                message: "This handle is already taken. Please choose another.",
            });
            return;
        }

        if (error.message === "User already has a channel") {
            res.status(409).json({
                error: "Conflict",
                message: "You already have a channel",
            });
            return;
        }

        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to create channel",
        });
    }
});

/**
 * PATCH /api/channel/:id
 * Update a channel (requires ownership or admin)
 */
router.patch(
    "/:id",
    requireOwnershipOrAdmin(async (req) => {
        const channelId = req.params.id;
        if (!channelId) return null;
        return getChannelOwnerId(channelId);
    }),
    async (req, res) => {
        try {
            const channelId = req.params.id;
            if (!channelId) {
                res.status(400).json({
                    error: "Bad Request",
                    message: "Channel ID is required",
                });
                return;
            }

            const { name, description, avatar, banner } = req.body;

            // Validate inputs
            if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
                res.status(400).json({
                    error: "Bad Request",
                    message: "Channel name cannot be empty",
                });
                return;
            }

            const channel = await updateChannel(channelId, {
                name: name?.trim(),
                description: description?.trim(),
                avatar,
                banner,
            });

            res.json({
                success: true,
                data: channel,
                message: "Channel updated successfully",
            });
        } catch (error) {
            console.error("Update channel error:", error);
            res.status(500).json({
                error: "Internal Server Error",
                message: "Failed to update channel",
            });
        }
    }
);

/**
 * DELETE /api/channel/:id
 * Delete a channel (requires ownership or admin)
 */
router.delete(
    "/:id",
    requireOwnershipOrAdmin(async (req) => {
        const channelId = req.params.id;
        if (!channelId) return null;
        return getChannelOwnerId(channelId);
    }),
    async (req, res) => {
        try {
            const channelId = req.params.id;
            if (!channelId) {
                res.status(400).json({
                    error: "Bad Request",
                    message: "Channel ID is required",
                });
                return;
            }

            await deleteChannel(channelId);

            res.json({
                success: true,
                message: "Channel deleted successfully",
            });
        } catch (error) {
            console.error("Delete channel error:", error);
            res.status(500).json({
                error: "Internal Server Error",
                message: "Failed to delete channel",
            });
        }
    }
);

// ============================================
// Subscription Routes
// ============================================

/**
 * POST /api/channel/:id/subscribe
 * Subscribe to a channel
 */
router.post("/:id/subscribe", requireViewer, async (req, res) => {
    try {
        const channelId = req.params.id;
        if (!channelId) {
            res.status(400).json({
                error: "Bad Request",
                message: "Channel ID is required",
            });
            return;
        }

        const context = getAuthContext(req);
        const { notifications = true } = req.body;

        // Check if channel exists
        const channel = await getChannelById(channelId);
        if (!channel) {
            res.status(404).json({
                error: "Not Found",
                message: "Channel not found",
            });
            return;
        }

        if (!context.user.profile?.id) {
            res.status(400).json({
                error: "Bad Request",
                message: "User profile not found",
            });
            return;
        }

        // Can't subscribe to your own channel
        if (context.user.profile.id === channel.userProfile.id) {
            res.status(400).json({
                error: "Bad Request",
                message: "You cannot subscribe to your own channel",
            });
            return;
        }

        const subscription = await subscribe(
            context.user.profile.id,
            channelId,
            notifications
        );

        res.status(201).json({
            success: true,
            data: subscription,
            message: "Subscribed successfully",
        });
    } catch (error: any) {
        console.error("Subscribe error:", error);

        if (error.message === "Already subscribed to this channel") {
            res.status(409).json({
                error: "Conflict",
                message: "You are already subscribed to this channel",
            });
            return;
        }

        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to subscribe",
        });
    }
});

/**
 * DELETE /api/channel/:id/subscribe
 * Unsubscribe from a channel
 */
router.delete("/:id/subscribe", requireViewer, async (req, res) => {
    try {
        const channelId = req.params.id;
        if (!channelId) {
            res.status(400).json({
                error: "Bad Request",
                message: "Channel ID is required",
            });
            return;
        }

        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({
                error: "Bad Request",
                message: "User profile not found",
            });
            return;
        }

        await unsubscribe(context.user.profile.id, channelId);

        res.json({
            success: true,
            message: "Unsubscribed successfully",
        });
    } catch (error: any) {
        console.error("Unsubscribe error:", error);

        if (error.message === "Not subscribed to this channel") {
            res.status(400).json({
                error: "Bad Request",
                message: "You are not subscribed to this channel",
            });
            return;
        }

        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to unsubscribe",
        });
    }
});

/**
 * GET /api/channel/:id/subscription
 * Check subscription status for a channel
 */
router.get("/:id/subscription", requireViewer, async (req, res) => {
    try {
        const channelId = req.params.id;
        if (!channelId) {
            res.status(400).json({
                error: "Bad Request",
                message: "Channel ID is required",
            });
            return;
        }

        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({
                error: "Bad Request",
                message: "User profile not found",
            });
            return;
        }

        const subscribed = await isSubscribed(context.user.profile.id, channelId);

        res.json({
            success: true,
            data: { isSubscribed: subscribed },
        });
    } catch (error) {
        console.error("Check subscription error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to check subscription status",
        });
    }
});

export default router;
