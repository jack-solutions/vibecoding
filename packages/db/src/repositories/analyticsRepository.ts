import prisma from "../index";

// ============================================
// Types
// ============================================

export interface DailyMetrics {
    date: Date;
    views: number;
    uniqueViewers: number;
    watchTime: number; // seconds
    likes: number;
    dislikes: number;
    comments: number;
    shares: number;
    impressions: number;
}

export interface AnalyticsSummary {
    totalViews: number;
    totalWatchTime: number;
    totalLikes: number;
    totalComments: number;
    averageViewDuration: number;
    ctr: number; // Click-through rate
    dailyMetrics: DailyMetrics[];
}

export interface TimeRange {
    startDate: Date;
    endDate: Date;
}

// ============================================
// Repository Functions
// ============================================

/**
 * Get analytics for a specific video within a time range
 */
export async function getVideoAnalytics(
    videoId: string,
    range: TimeRange
): Promise<AnalyticsSummary> {
    const { startDate, endDate } = range;

    const analytics = await prisma.videoAnalytics.findMany({
        where: {
            videoId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: { date: "asc" },
    });

    // Aggregate totals
    const summary = analytics.reduce(
        (acc, day) => {
            acc.totalViews += day.views;
            acc.totalWatchTime += day.totalWatchTime;
            acc.totalLikes += day.likes;
            acc.totalComments += day.comments;
            acc.totalImpressions += day.impressions;
            return acc;
        },
        {
            totalViews: 0,
            totalWatchTime: 0,
            totalLikes: 0,
            totalComments: 0,
            totalImpressions: 0,
        }
    );

    const averageViewDuration =
        summary.totalViews > 0 ? summary.totalWatchTime / summary.totalViews : 0;

    const ctr =
        summary.totalImpressions > 0
            ? (summary.totalViews / summary.totalImpressions) * 100
            : 0;

    return {
        totalViews: summary.totalViews,
        totalWatchTime: summary.totalWatchTime,
        totalLikes: summary.totalLikes,
        totalComments: summary.totalComments,
        averageViewDuration,
        ctr,
        dailyMetrics: analytics.map((day) => ({
            date: day.date,
            views: day.views,
            uniqueViewers: day.uniqueViewers,
            watchTime: day.totalWatchTime,
            likes: day.likes,
            dislikes: day.dislikes,
            comments: day.comments,
            shares: day.shares,
            impressions: day.impressions,
        })),
    };
}

/**
 * Get aggregated analytics for a channel within a time range
 */
export async function getChannelAnalytics(
    channelId: string,
    range: TimeRange
): Promise<AnalyticsSummary> {
    const { startDate, endDate } = range;

    // Get all videos for the channel
    const videos = await prisma.video.findMany({
        where: { channelId },
        select: { id: true },
    });

    const videoIds = videos.map((v) => v.id);

    if (videoIds.length === 0) {
        return {
            totalViews: 0,
            totalWatchTime: 0,
            totalLikes: 0,
            totalComments: 0,
            averageViewDuration: 0,
            ctr: 0,
            dailyMetrics: [],
        };
    }

    // Get analytics for all videos
    const analytics = await prisma.videoAnalytics.findMany({
        where: {
            videoId: { in: videoIds },
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: { date: "asc" },
    });

    // Group by date
    const dailyMap = new Map<string, DailyMetrics>();

    analytics.forEach((record) => {
        const dateKey = record.date.toISOString().split("T")[0];
        const existing = dailyMap.get(dateKey) || {
            date: record.date,
            views: 0,
            uniqueViewers: 0,
            watchTime: 0,
            likes: 0,
            dislikes: 0,
            comments: 0,
            shares: 0,
            impressions: 0,
        };

        existing.views += record.views;
        existing.uniqueViewers += record.uniqueViewers;
        existing.watchTime += record.totalWatchTime;
        existing.likes += record.likes;
        existing.dislikes += record.dislikes;
        existing.comments += record.comments;
        existing.shares += record.shares;
        existing.impressions += record.impressions;

        dailyMap.set(dateKey, existing);
    });

    const dailyMetrics = Array.from(dailyMap.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
    );

    // Aggregate totals
    const summary = dailyMetrics.reduce(
        (acc, day) => {
            acc.totalViews += day.views;
            acc.totalWatchTime += day.watchTime;
            acc.totalLikes += day.likes;
            acc.totalComments += day.comments;
            acc.totalImpressions += day.impressions;
            return acc;
        },
        {
            totalViews: 0,
            totalWatchTime: 0,
            totalLikes: 0,
            totalComments: 0,
            totalImpressions: 0,
        }
    );

    const averageViewDuration =
        summary.totalViews > 0 ? summary.totalWatchTime / summary.totalViews : 0;

    const ctr =
        summary.totalImpressions > 0
            ? (summary.totalViews / summary.totalImpressions) * 100
            : 0;

    return {
        totalViews: summary.totalViews,
        totalWatchTime: summary.totalWatchTime,
        totalLikes: summary.totalLikes,
        totalComments: summary.totalComments,
        averageViewDuration,
        ctr,
        dailyMetrics,
    };
}

/**
 * Increment analytics metric for a video
 * This is a helper to update daily stats in real-time
 */
export async function incrementVideoMetric(
    videoId: string,
    metric: "views" | "likes" | "dislikes" | "comments" | "shares",
    value: number = 1
) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updateData: any = {};
    if (metric === "views") updateData.views = { increment: value };
    else if (metric === "likes") updateData.likes = { increment: value };
    else if (metric === "dislikes") updateData.dislikes = { increment: value };
    else if (metric === "comments") updateData.comments = { increment: value };
    else if (metric === "shares") updateData.shares = { increment: value };

    return prisma.videoAnalytics.upsert({
        where: {
            videoId_date: {
                videoId,
                date: today,
            },
        },
        create: {
            videoId,
            date: today,
            views: metric === "views" ? value : 0,
            likes: metric === "likes" ? value : 0,
            dislikes: metric === "dislikes" ? value : 0,
            comments: metric === "comments" ? value : 0,
            shares: metric === "shares" ? value : 0,
        },
        update: updateData,
    });
}

/**
 * Update watch time metrics
 */
export async function updateWatchMetrics(
    videoId: string,
    secondsWatched: number
) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First get current stats to calculate average
    const current = await prisma.videoAnalytics.findUnique({
        where: {
            videoId_date: {
                videoId,
                date: today,
            },
        },
    });

    const newTotalWatchTime = (current?.totalWatchTime || 0) + secondsWatched;
    const views = current?.views || 1; // Avoid division by zero
    const averageWatchTime = newTotalWatchTime / views;

    return prisma.videoAnalytics.upsert({
        where: {
            videoId_date: {
                videoId,
                date: today,
            },
        },
        create: {
            videoId,
            date: today,
            totalWatchTime: secondsWatched,
            averageWatchTime: secondsWatched, // For the first view/watch
        },
        update: {
            totalWatchTime: { increment: secondsWatched },
            averageWatchTime,
        },
    });
}
