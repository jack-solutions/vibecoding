import { Router } from "express";
import type { Router as ExpressRouter, Request, Response } from "express";
import { requireAuth, getAuthContext } from "@vc-yt-clone/auth";
import {
    getChannelOwnerId,
    getVideoOwnerId,
} from "@vc-yt-clone/db";
import {
    getVideoAnalytics,
    getChannelAnalytics,
    parseTimeRange,
} from "../services";

const router: ExpressRouter = Router();

// ============================================
// Routes
// ============================================

/**
 * GET /api/analytics/channel/:channelId
 * Get analytics for a specific channel
 */
router.get("/channel/:channelId", requireAuth, async (req: Request, res: Response) => {
    try {
        const { channelId } = req.params;
        const { period, startDate, endDate } = req.query;
        const context = getAuthContext(req);
        const userProfileId = context.user.profile?.id;

        if (!channelId) {
            res.status(400).json({
                success: false,
                message: "Channel ID is required",
            });
            return;
        }

        // Check ownership
        const ownerId = await getChannelOwnerId(channelId);

        if (!ownerId) {
            res.status(404).json({
                success: false,
                message: "Channel not found",
            });
            return;
        }

        if (ownerId !== userProfileId) {
            res.status(403).json({
                success: false,
                message: "Not authorized to view analytics for this channel",
            });
            return;
        }

        const range = parseTimeRange(
            period as string,
            startDate as string,
            endDate as string
        );

        const analytics = await getChannelAnalytics(channelId, range);

        res.json({
            success: true,
            data: analytics,
        });
    } catch (error) {
        console.error("Channel analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get channel analytics",
        });
    }
});

/**
 * GET /api/analytics/video/:videoId
 * Get analytics for a specific video
 */
router.get("/video/:videoId", requireAuth, async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        const { period, startDate, endDate } = req.query;
        const context = getAuthContext(req);
        const userProfileId = context.user.profile?.id;

        if (!videoId) {
            res.status(400).json({
                success: false,
                message: "Video ID is required",
            });
            return;
        }

        // Check ownership
        const ownerId = await getVideoOwnerId(videoId);

        if (!ownerId) {
            res.status(404).json({
                success: false,
                message: "Video not found",
            });
            return;
        }

        if (ownerId !== userProfileId) {
            res.status(403).json({
                success: false,
                message: "Not authorized to view analytics for this video",
            });
            return;
        }

        const range = parseTimeRange(
            period as string,
            startDate as string,
            endDate as string
        );

        const analytics = await getVideoAnalytics(videoId, range);

        res.json({
            success: true,
            data: analytics,
        });
    } catch (error) {
        console.error("Video analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get video analytics",
        });
    }
});

export default router;
