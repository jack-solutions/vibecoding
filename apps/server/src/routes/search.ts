import { Router } from "express";
import type { Router as ExpressRouter, Request, Response } from "express";
import { requireAuth, attachAuthContext, getAuthContext } from "@vc-yt-clone/auth";
import {
    search,
    searchVideosAdvanced,
    searchChannelsOnly,
    getSearchSuggestions,
    getFilterOptions,
    getTrending,
    getPersonalizedRecommendations,
    getRelated,
    getSubscriptionsFeed,
    getHomeFeed,
    getPopularChannelsRecommendation,
    getCategoryVideos,
} from "../services";

const router: ExpressRouter = Router();

// ============================================
// Search Routes
// ============================================

/**
 * GET /api/search
 * Unified search across videos and channels
 */
router.get("/", async (req: Request, res: Response) => {
    try {
        const {
            q,
            type = "all",
            category,
            uploadDate,
            duration,
            sortBy = "relevance",
            limit = "20",
            offset = "0",
        } = req.query;

        if (!q || typeof q !== "string") {
            res.status(400).json({
                success: false,
                message: "Search query is required",
            });
            return;
        }

        const results = await search({
            query: q,
            type: type as "video" | "channel" | "all",
            category: category as string | undefined,
            uploadDate: uploadDate as "hour" | "today" | "week" | "month" | "year" | undefined,
            duration: duration as "short" | "medium" | "long" | undefined,
            sortBy: sortBy as "relevance" | "date" | "views" | "rating",
            limit: parseInt(limit as string, 10),
            offset: parseInt(offset as string, 10),
        });

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to perform search",
        });
    }
});

/**
 * GET /api/search/videos
 * Search only videos with advanced filters
 */
router.get("/videos", async (req: Request, res: Response) => {
    try {
        const {
            q,
            category,
            uploadDate,
            duration,
            sortBy = "relevance",
            limit = "20",
            offset = "0",
        } = req.query;

        if (!q || typeof q !== "string") {
            res.status(400).json({
                success: false,
                message: "Search query is required",
            });
            return;
        }

        const results = await searchVideosAdvanced({
            query: q,
            category: category as string | undefined,
            uploadDate: uploadDate as "hour" | "today" | "week" | "month" | "year" | undefined,
            duration: duration as "short" | "medium" | "long" | undefined,
            sortBy: sortBy as "relevance" | "date" | "views" | "rating",
            limit: parseInt(limit as string, 10),
            offset: parseInt(offset as string, 10),
        });

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Video search error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search videos",
        });
    }
});

/**
 * GET /api/search/channels
 * Search only channels
 */
router.get("/channels", async (req: Request, res: Response) => {
    try {
        const { q, limit = "20", offset = "0" } = req.query;

        if (!q || typeof q !== "string") {
            res.status(400).json({
                success: false,
                message: "Search query is required",
            });
            return;
        }

        const results = await searchChannelsOnly(
            q,
            parseInt(limit as string, 10),
            parseInt(offset as string, 10)
        );

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Channel search error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search channels",
        });
    }
});

/**
 * GET /api/search/suggestions
 * Get search suggestions for autocomplete
 */
router.get("/suggestions", async (req: Request, res: Response) => {
    try {
        const { q, limit = "5" } = req.query;

        if (!q || typeof q !== "string") {
            res.json({
                success: true,
                data: [],
            });
            return;
        }

        const suggestions = await getSearchSuggestions(
            q,
            parseInt(limit as string, 10)
        );

        res.json({
            success: true,
            data: suggestions,
        });
    } catch (error) {
        console.error("Suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get suggestions",
        });
    }
});

/**
 * GET /api/search/filters
 * Get available filter options
 */
router.get("/filters", async (_req: Request, res: Response) => {
    try {
        const filters = await getFilterOptions();

        res.json({
            success: true,
            data: filters,
        });
    } catch (error) {
        console.error("Filters error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get filter options",
        });
    }
});

// ============================================
// Discovery Routes
// ============================================

/**
 * GET /api/search/trending
 * Get trending videos
 */
router.get("/trending", async (req: Request, res: Response) => {
    try {
        const { category, limit = "20", timeRange = "week" } = req.query;

        const results = await getTrending({
            category: category as string | undefined,
            limit: parseInt(limit as string, 10),
            timeRange: timeRange as "day" | "week" | "month",
        });

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Trending error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get trending videos",
        });
    }
});

/**
 * GET /api/search/recommendations
 * Get personalized recommendations (requires auth for personalization)
 */
router.get(
    "/recommendations",
    attachAuthContext,
    async (req: Request, res: Response) => {
        try {
            const { limit = "20", offset = "0", exclude } = req.query;
            const userProfileId = req.authContext?.user?.profile?.id;

            const excludeVideoIds = exclude
                ? (exclude as string).split(",")
                : [];

            const results = await getPersonalizedRecommendations({
                userProfileId,
                limit: parseInt(limit as string, 10),
                offset: parseInt(offset as string, 10),
                excludeVideoIds,
            });

            res.json({
                success: true,
                data: results,
            });
        } catch (error) {
            console.error("Recommendations error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get recommendations",
            });
        }
    }
);

/**
 * GET /api/search/related/:videoId
 * Get videos related to a specific video
 */
router.get("/related/:videoId", async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        const { limit = "10" } = req.query;

        if (!videoId) {
            res.status(400).json({
                success: false,
                message: "Video ID is required",
            });
            return;
        }

        const results = await getRelated(
            videoId,
            parseInt(limit as string, 10)
        );

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Related videos error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get related videos",
        });
    }
});

/**
 * GET /api/search/subscriptions
 * Get videos from subscribed channels (requires auth)
 */
router.get(
    "/subscriptions",
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            const { limit = "20", offset = "0" } = req.query;
            const context = getAuthContext(req);
            const userProfileId = context.user.profile?.id;

            if (!userProfileId) {
                res.status(401).json({
                    success: false,
                    message: "User profile not found",
                });
                return;
            }

            const results = await getSubscriptionsFeed(
                userProfileId,
                parseInt(limit as string, 10),
                parseInt(offset as string, 10)
            );

            res.json({
                success: true,
                data: results,
            });
        } catch (error) {
            console.error("Subscriptions feed error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get subscription feed",
            });
        }
    }
);

/**
 * GET /api/search/home
 * Get home feed with multiple sections
 */
router.get(
    "/home",
    attachAuthContext,
    async (req: Request, res: Response) => {
        try {
            const { limit = "10" } = req.query;
            const userProfileId = req.authContext?.user?.profile?.id;

            const results = await getHomeFeed({
                userProfileId,
                limit: parseInt(limit as string, 10),
            });

            res.json({
                success: true,
                data: results,
            });
        } catch (error) {
            console.error("Home feed error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get home feed",
            });
        }
    }
);

/**
 * GET /api/search/popular-channels
 * Get popular channels for discovery
 */
router.get("/popular-channels", async (req: Request, res: Response) => {
    try {
        const { limit = "10" } = req.query;

        const results = await getPopularChannelsRecommendation(
            parseInt(limit as string, 10)
        );

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Popular channels error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get popular channels",
        });
    }
});

/**
 * GET /api/search/category/:category
 * Get videos by category
 */
router.get("/category/:category", async (req: Request, res: Response) => {
    try {
        const { category } = req.params;
        const { limit = "20", offset = "0" } = req.query;

        if (!category) {
            res.status(400).json({
                success: false,
                message: "Category is required",
            });
            return;
        }

        const results = await getCategoryVideos(
            category,
            parseInt(limit as string, 10),
            parseInt(offset as string, 10)
        );

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error("Category videos error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get category videos",
        });
    }
});

export default router;
