import {
    getTrendingVideos,
    getRelatedVideos,
    getSubscriptionFeed,
    getVideos,
    getVideosByCategory,
    getPopularChannels,
} from "@vc-yt-clone/db";

// ============================================
// Types
// ============================================

export interface RecommendationOptions {
    userProfileId?: string;
    limit?: number;
    offset?: number;
    excludeVideoIds?: string[];
}

export interface TrendingOptions {
    category?: string;
    limit?: number;
    timeRange?: "day" | "week" | "month";
}

export interface RecommendationResult {
    videos: any[];
    source: string;
    hasMore: boolean;
}

export interface HomeFeedResult {
    sections: {
        title: string;
        type: "trending" | "recommended" | "subscriptions" | "category";
        videos: any[];
        channelId?: string;
        category?: string;
    }[];
}

// ============================================
// Recommendation Service Functions
// ============================================

/**
 * Get trending videos
 */
export async function getTrending(
    options: TrendingOptions = {}
): Promise<RecommendationResult> {
    const { category, limit = 20 } = options;

    let videos;
    if (category) {
        // Get trending videos in a specific category
        const result = await getVideosByCategory(category, limit, 0);
        videos = result.videos;
    } else {
        // Get overall trending videos
        videos = await getTrendingVideos(limit);
    }

    return {
        videos,
        source: category ? `trending:${category}` : "trending:all",
        hasMore: videos.length === limit,
    };
}

/**
 * Get personalized recommendations for a user
 */
export async function getPersonalizedRecommendations(
    options: RecommendationOptions = {}
): Promise<RecommendationResult> {
    const { userProfileId, limit = 20, offset = 0, excludeVideoIds = [] } = options;

    let videos: any[] = [];

    if (userProfileId) {
        // Get subscription feed first
        const subscriptionFeed = await getSubscriptionFeed(
            userProfileId,
            Math.ceil(limit / 2),
            0
        );
        videos = subscriptionFeed.videos;

        // Fill remaining slots with trending videos
        if (videos.length < limit) {
            const trendingVideos = await getTrendingVideos(limit - videos.length);
            const existingIds = new Set(videos.map((v) => v.id));

            for (const video of trendingVideos) {
                if (!existingIds.has(video.id) && !excludeVideoIds.includes(video.id)) {
                    videos.push(video);
                    if (videos.length >= limit) break;
                }
            }
        }
    } else {
        // For non-logged-in users, show trending and popular videos
        videos = await getTrendingVideos(limit);
    }

    // Filter out excluded videos
    if (excludeVideoIds.length > 0) {
        videos = videos.filter((v) => !excludeVideoIds.includes(v.id));
    }

    return {
        videos: videos.slice(offset, offset + limit),
        source: userProfileId ? "personalized" : "trending",
        hasMore: videos.length > offset + limit,
    };
}

/**
 * Get videos related to a specific video
 */
export async function getRelated(
    videoId: string,
    limit: number = 10
): Promise<RecommendationResult> {
    const videos = await getRelatedVideos(videoId, limit);

    return {
        videos,
        source: `related:${videoId}`,
        hasMore: videos.length === limit,
    };
}

/**
 * Get videos from user's subscriptions
 */
export async function getSubscriptionsFeed(
    userProfileId: string,
    limit: number = 20,
    offset: number = 0
): Promise<RecommendationResult> {
    const result = await getSubscriptionFeed(userProfileId, limit, offset);

    return {
        videos: result.videos,
        source: "subscriptions",
        hasMore: offset + limit < result.total,
    };
}

/**
 * Get home feed with multiple sections
 * This creates a YouTube-like home page with different video sections
 */
export async function getHomeFeed(
    options: RecommendationOptions = {}
): Promise<HomeFeedResult> {
    const { userProfileId, limit = 10 } = options;

    const sections: HomeFeedResult["sections"] = [];

    // Section 1: Trending Videos
    const trending = await getTrendingVideos(limit);
    if (trending.length > 0) {
        sections.push({
            title: "Trending",
            type: "trending",
            videos: trending,
        });
    }

    // Section 2: Subscription Feed (if logged in)
    if (userProfileId) {
        const subscriptions = await getSubscriptionFeed(userProfileId, limit, 0);
        if (subscriptions.videos.length > 0) {
            sections.push({
                title: "From your subscriptions",
                type: "subscriptions",
                videos: subscriptions.videos,
            });
        }
    }

    // Section 3: Recommended (mix of recent and popular)
    const recommended = await getVideos({
        limit,
        visibility: "PUBLIC",
        processStatus: "COMPLETED",
        sortBy: "popular",
    });
    if (recommended.videos.length > 0) {
        sections.push({
            title: "Recommended for you",
            type: "recommended",
            videos: recommended.videos,
        });
    }

    // Section 4: Latest uploads
    const latest = await getVideos({
        limit,
        visibility: "PUBLIC",
        processStatus: "COMPLETED",
        sortBy: "newest",
    });
    if (latest.videos.length > 0) {
        // Add as a category section
        sections.push({
            title: "New uploads",
            type: "category",
            videos: latest.videos,
            category: "latest",
        });
    }

    return { sections };
}

/**
 * Get popular channels for discovery
 */
export async function getPopularChannelsRecommendation(limit: number = 10) {
    const channels = await getPopularChannels(limit);

    return {
        channels,
        hasMore: channels.length === limit,
    };
}

/**
 * Get "Watch Again" videos - videos the user has watched before
 * This is a placeholder for future implementation with view history
 */
export async function getWatchAgain(
    _userProfileId: string,
    _limit: number = 10
): Promise<RecommendationResult> {
    // TODO: Implement watch history-based recommendations
    // For now, return empty result
    return {
        videos: [],
        source: "watch_again",
        hasMore: false,
    };
}

/**
 * Get videos by category for category-based browsing
 */
export async function getCategoryVideos(
    category: string,
    limit: number = 20,
    offset: number = 0
): Promise<RecommendationResult> {
    const result = await getVideosByCategory(category, limit, offset);

    return {
        videos: result.videos,
        source: `category:${category}`,
        hasMore: offset + limit < result.total,
    };
}

/**
 * Calculate a simple trending score for a video
 * Used internally for ranking videos
 */
export function calculateTrendingScore(video: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    uploadedAt: Date;
}): number {
    const now = Date.now();
    const uploadTime = new Date(video.uploadedAt).getTime();
    const ageInHours = (now - uploadTime) / (1000 * 60 * 60);

    // Views weight decreases over time
    const viewScore = video.viewCount / Math.pow(ageInHours + 1, 1.5);

    // Engagement score (likes + comments)
    const engagementScore = (video.likeCount * 2 + video.commentCount) / 10;

    return viewScore + engagementScore;
}
