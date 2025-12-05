import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
    getUserProfile,
    updateUserProfile,
    upgradeToCreator,
    getUserSubscriptions,
    getUserWatchHistory,
    getUserLikedVideos,
} from "@vc-yt-clone/db";
import {
    requireAuth,
    getAuthContext,
    requireViewer,
} from "@vc-yt-clone/auth";

const router: ExpressRouter = Router();

// ============================================
// Profile Routes
// ============================================

/**
 * GET /api/user/profile
 * Get the current user's profile
 */
router.get("/profile", requireAuth, async (req, res) => {
    try {
        const context = getAuthContext(req);
        const profile = await getUserProfile(context.user.id);

        if (!profile) {
            res.status(404).json({
                error: "Not Found",
                message: "User profile not found",
            });
            return;
        }

        res.json({
            success: true,
            data: profile,
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to get profile",
        });
    }
});

/**
 * PATCH /api/user/profile
 * Update the current user's profile
 */
router.patch("/profile", requireViewer, async (req, res) => {
    try {
        const context = getAuthContext(req);
        const { bio, avatar, banner } = req.body;

        // Validate input
        if (bio !== undefined && typeof bio !== "string") {
            res.status(400).json({
                error: "Bad Request",
                message: "Bio must be a string",
            });
            return;
        }

        if (avatar !== undefined && typeof avatar !== "string") {
            res.status(400).json({
                error: "Bad Request",
                message: "Avatar must be a string URL",
            });
            return;
        }

        if (banner !== undefined && typeof banner !== "string") {
            res.status(400).json({
                error: "Bad Request",
                message: "Banner must be a string URL",
            });
            return;
        }

        const profile = await updateUserProfile(context.user.id, {
            bio,
            avatar,
            banner,
        });

        res.json({
            success: true,
            data: profile,
            message: "Profile updated successfully",
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to update profile",
        });
    }
});

// ============================================
// Creator Upgrade Route
// ============================================

/**
 * POST /api/user/upgrade-creator
 * Upgrade the current user to a creator and create a channel
 */
router.post("/upgrade-creator", requireViewer, async (req, res) => {
    try {
        const context = getAuthContext(req);
        const { name, handle, description } = req.body;

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

        // Validate handle format (alphanumeric, underscores, hyphens only)
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

        const profile = await upgradeToCreator(context.user.id, {
            name: name.trim(),
            handle: handle.trim(),
            description: description?.trim(),
        });

        res.status(201).json({
            success: true,
            data: profile,
            message: "Successfully upgraded to creator",
        });
    } catch (error: any) {
        console.error("Upgrade to creator error:", error);

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
            message: "Failed to upgrade to creator",
        });
    }
});

// ============================================
// User Content Routes
// ============================================

/**
 * GET /api/user/subscriptions
 * Get the current user's subscriptions
 */
router.get("/subscriptions", requireViewer, async (req, res) => {
    try {
        const context = getAuthContext(req);

        if (!context.user.profile?.id) {
            res.status(400).json({
                error: "Bad Request",
                message: "User profile not found",
            });
            return;
        }

        const subscriptions = await getUserSubscriptions(context.user.profile.id);

        res.json({
            success: true,
            data: subscriptions,
        });
    } catch (error) {
        console.error("Get subscriptions error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to get subscriptions",
        });
    }
});

/**
 * GET /api/user/history
 * Get the current user's watch history
 */
router.get("/history", requireViewer, async (req, res) => {
    try {
        const context = getAuthContext(req);
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        if (!context.user.profile?.id) {
            res.status(400).json({
                error: "Bad Request",
                message: "User profile not found",
            });
            return;
        }

        const history = await getUserWatchHistory(
            context.user.profile.id,
            limit,
            offset
        );

        res.json({
            success: true,
            data: history,
        });
    } catch (error) {
        console.error("Get watch history error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to get watch history",
        });
    }
});

/**
 * GET /api/user/liked
 * Get the current user's liked videos
 */
router.get("/liked", requireViewer, async (req, res) => {
    try {
        const context = getAuthContext(req);
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        if (!context.user.profile?.id) {
            res.status(400).json({
                error: "Bad Request",
                message: "User profile not found",
            });
            return;
        }

        const likedVideos = await getUserLikedVideos(
            context.user.profile.id,
            limit,
            offset
        );

        res.json({
            success: true,
            data: likedVideos,
        });
    } catch (error) {
        console.error("Get liked videos error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to get liked videos",
        });
    }
});

export default router;
