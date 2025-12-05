import prisma from "../index";
import type {
    VideoVisibility,
    VideoProcessStatus,
} from "../../prisma/generated/client";

// ============================================
// Types
// ============================================

export interface CreateVideoInput {
    channelId: string;
    title: string;
    description?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    visibility?: VideoVisibility;
    category?: string;
    tags?: string[];
}

export interface UpdateVideoInput {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    visibility?: VideoVisibility;
    category?: string;
    tags?: string[];
}

export interface VideoWithChannel {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string | null;
    thumbnailUrl: string | null;
    duration: number;
    visibility: VideoVisibility;
    processStatus: VideoProcessStatus;
    viewCount: number;
    likeCount: number;
    dislikeCount: number;
    commentCount: number;
    category: string | null;
    tags: string | null;
    uploadedAt: Date;
    publishedAt: Date | null;
    channel: {
        id: string;
        name: string;
        handle: string;
        avatar: string | null;
        subscriberCount: number;
    };
}

export interface VideoListOptions {
    limit?: number;
    offset?: number;
    visibility?: VideoVisibility;
    processStatus?: VideoProcessStatus;
    channelId?: string;
    category?: string;
    sortBy?: "newest" | "oldest" | "popular" | "trending";
}

// ============================================
// Repository Functions
// ============================================

/**
 * Get a video by ID with full details
 */
export async function getVideoById(videoId: string) {
    return prisma.video.findUnique({
        where: { id: videoId },
        include: {
            channel: {
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    avatar: true,
                    subscriberCount: true,
                    verified: true,
                    userProfile: {
                        select: {
                            userId: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Get a video by ID (basic info only)
 */
export async function getVideoBasicById(videoId: string) {
    return prisma.video.findUnique({
        where: { id: videoId },
    });
}

/**
 * Create a new video
 */
export async function createVideo(input: CreateVideoInput) {
    const video = await prisma.video.create({
        data: {
            channelId: input.channelId,
            title: input.title,
            description: input.description,
            videoUrl: input.videoUrl,
            thumbnailUrl: input.thumbnailUrl,
            duration: input.duration || 0,
            visibility: input.visibility || "PRIVATE",
            category: input.category,
            tags: input.tags?.join(","),
            processStatus: input.videoUrl ? "PENDING" : "PENDING",
        },
    });

    // Update channel video count
    await prisma.channel.update({
        where: { id: input.channelId },
        data: { videoCount: { increment: 1 } },
    });

    return video;
}

/**
 * Update a video
 */
export async function updateVideo(videoId: string, input: UpdateVideoInput) {
    return prisma.video.update({
        where: { id: videoId },
        data: {
            title: input.title,
            description: input.description,
            thumbnailUrl: input.thumbnailUrl,
            visibility: input.visibility,
            category: input.category,
            tags: input.tags?.join(","),
        },
    });
}

/**
 * Update video URL and processing status
 */
export async function updateVideoUrl(
    videoId: string,
    videoUrl: string,
    processStatus: VideoProcessStatus = "PENDING"
) {
    return prisma.video.update({
        where: { id: videoId },
        data: {
            videoUrl,
            processStatus,
        },
    });
}

/**
 * Update video processing status
 */
export async function updateVideoProcessStatus(
    videoId: string,
    processStatus: VideoProcessStatus,
    duration?: number
) {
    const data: any = { processStatus };

    if (processStatus === "COMPLETED") {
        data.publishedAt = new Date();
    }

    if (duration !== undefined) {
        data.duration = duration;
    }

    return prisma.video.update({
        where: { id: videoId },
        data,
    });
}

/**
 * Update video thumbnail
 */
export async function updateVideoThumbnail(
    videoId: string,
    thumbnailUrl: string
) {
    return prisma.video.update({
        where: { id: videoId },
        data: { thumbnailUrl },
    });
}

/**
 * Delete a video
 */
export async function deleteVideo(videoId: string) {
    const video = await prisma.video.findUnique({
        where: { id: videoId },
        select: { channelId: true },
    });

    if (!video) {
        throw new Error("Video not found");
    }

    // Delete video and update channel count
    await prisma.$transaction([
        prisma.video.delete({
            where: { id: videoId },
        }),
        prisma.channel.update({
            where: { id: video.channelId },
            data: { videoCount: { decrement: 1 } },
        }),
    ]);
}

/**
 * Get videos with filtering and pagination
 */
export async function getVideos(options: VideoListOptions = {}) {
    const {
        limit = 20,
        offset = 0,
        visibility,
        processStatus,
        channelId,
        category,
        sortBy = "newest",
    } = options;

    const where: any = {};

    if (visibility) {
        where.visibility = visibility;
    }

    if (processStatus) {
        where.processStatus = processStatus;
    }

    if (channelId) {
        where.channelId = channelId;
    }

    if (category) {
        where.category = category;
    }

    // Default: only show public and completed videos
    if (!visibility && !processStatus) {
        where.visibility = "PUBLIC";
        where.processStatus = "COMPLETED";
    }

    const orderBy: any = {};
    switch (sortBy) {
        case "oldest":
            orderBy.uploadedAt = "asc";
            break;
        case "popular":
            orderBy.viewCount = "desc";
            break;
        case "trending":
            // Simple trending: combination of recency and views
            // For a more sophisticated algorithm, use a dedicated function
            orderBy.viewCount = "desc";
            break;
        case "newest":
        default:
            orderBy.uploadedAt = "desc";
    }

    const [videos, total] = await Promise.all([
        prisma.video.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset,
            include: {
                channel: {
                    select: {
                        id: true,
                        name: true,
                        handle: true,
                        avatar: true,
                        verified: true,
                    },
                },
            },
        }),
        prisma.video.count({ where }),
    ]);

    return { videos, total };
}

/**
 * Get videos for a specific channel
 */
export async function getVideosByChannelId(
    channelId: string,
    options: {
        limit?: number;
        offset?: number;
        visibility?: VideoVisibility;
        includeProcessing?: boolean;
    } = {}
) {
    const {
        limit = 20,
        offset = 0,
        visibility,
        includeProcessing = false,
    } = options;

    const where: any = { channelId };

    if (visibility) {
        where.visibility = visibility;
    } else {
        // By default, only show public videos
        where.visibility = "PUBLIC";
    }

    if (!includeProcessing) {
        where.processStatus = "COMPLETED";
    }

    const [videos, total] = await Promise.all([
        prisma.video.findMany({
            where,
            orderBy: { uploadedAt: "desc" },
            take: limit,
            skip: offset,
            select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                duration: true,
                viewCount: true,
                likeCount: true,
                visibility: true,
                processStatus: true,
                uploadedAt: true,
                publishedAt: true,
            },
        }),
        prisma.video.count({ where }),
    ]);

    return { videos, total };
}

/**
 * Increment view count for a video
 */
export async function incrementViewCount(videoId: string) {
    return prisma.video.update({
        where: { id: videoId },
        data: { viewCount: { increment: 1 } },
    });
}

/**
 * Record a view with watch data
 */
export async function recordView(
    videoId: string,
    data: {
        userProfileId?: string;
        watchDuration?: number;
        watchPercentage?: number;
        ipAddress?: string;
        userAgent?: string;
    }
) {
    // Create view record
    const view = await prisma.view.create({
        data: {
            videoId,
            userProfileId: data.userProfileId,
            watchDuration: data.watchDuration || 0,
            watchPercentage: data.watchPercentage || 0,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
        },
    });

    // Increment view count on video
    await incrementViewCount(videoId);

    // Update channel total views
    const video = await prisma.video.findUnique({
        where: { id: videoId },
        select: { channelId: true },
    });

    if (video) {
        await prisma.channel.update({
            where: { id: video.channelId },
            data: { totalViews: { increment: 1 } },
        });
    }

    return view;
}

/**
 * Search videos by title, description, or tags
 */
export async function searchVideos(
    query: string,
    options: {
        limit?: number;
        offset?: number;
        category?: string;
        sortBy?: "relevance" | "date" | "views";
    } = {}
) {
    const { limit = 20, offset = 0, category, sortBy = "relevance" } = options;

    const where: any = {
        visibility: "PUBLIC",
        processStatus: "COMPLETED",
        OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { tags: { contains: query } },
        ],
    };

    if (category) {
        where.category = category;
    }

    let orderBy: any;
    switch (sortBy) {
        case "date":
            orderBy = { uploadedAt: "desc" };
            break;
        case "views":
            orderBy = { viewCount: "desc" };
            break;
        case "relevance":
        default:
            // For SQLite, we'll use view count as a proxy for relevance
            orderBy = { viewCount: "desc" };
    }

    const [videos, total] = await Promise.all([
        prisma.video.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset,
            include: {
                channel: {
                    select: {
                        id: true,
                        name: true,
                        handle: true,
                        avatar: true,
                        verified: true,
                    },
                },
            },
        }),
        prisma.video.count({ where }),
    ]);

    return { videos, total };
}

/**
 * Get trending videos
 */
export async function getTrendingVideos(limit: number = 20) {
    // Simple trending: most viewed in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return prisma.video.findMany({
        where: {
            visibility: "PUBLIC",
            processStatus: "COMPLETED",
            uploadedAt: { gte: sevenDaysAgo },
        },
        orderBy: { viewCount: "desc" },
        take: limit,
        include: {
            channel: {
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    avatar: true,
                    verified: true,
                },
            },
        },
    });
}

/**
 * Get related videos based on category and tags
 */
export async function getRelatedVideos(
    videoId: string,
    limit: number = 10
) {
    const video = await prisma.video.findUnique({
        where: { id: videoId },
        select: { category: true, tags: true, channelId: true },
    });

    if (!video) {
        return [];
    }

    const where: any = {
        id: { not: videoId },
        visibility: "PUBLIC",
        processStatus: "COMPLETED",
    };

    // Match by category or channel
    if (video.category || video.channelId) {
        where.OR = [];
        if (video.category) {
            where.OR.push({ category: video.category });
        }
        // Include other videos from same channel
        where.OR.push({ channelId: video.channelId });
    }

    return prisma.video.findMany({
        where,
        orderBy: { viewCount: "desc" },
        take: limit,
        include: {
            channel: {
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    avatar: true,
                    verified: true,
                },
            },
        },
    });
}

/**
 * Get videos from subscribed channels
 */
export async function getSubscriptionFeed(
    userProfileId: string,
    limit: number = 20,
    offset: number = 0
) {
    // First get all subscribed channel IDs
    const subscriptions = await prisma.subscription.findMany({
        where: { subscriberId: userProfileId },
        select: { channelId: true },
    });

    const channelIds = subscriptions.map((sub) => sub.channelId);

    if (channelIds.length === 0) {
        return { videos: [], total: 0 };
    }

    const where = {
        channelId: { in: channelIds },
        visibility: "PUBLIC" as VideoVisibility,
        processStatus: "COMPLETED" as VideoProcessStatus,
    };

    const [videos, total] = await Promise.all([
        prisma.video.findMany({
            where,
            orderBy: { uploadedAt: "desc" },
            take: limit,
            skip: offset,
            include: {
                channel: {
                    select: {
                        id: true,
                        name: true,
                        handle: true,
                        avatar: true,
                        verified: true,
                    },
                },
            },
        }),
        prisma.video.count({ where }),
    ]);

    return { videos, total };
}

/**
 * Get the owner's user profile ID for a video
 */
export async function getVideoOwnerId(videoId: string): Promise<string | null> {
    const video = await prisma.video.findUnique({
        where: { id: videoId },
        select: {
            channel: {
                select: { userProfileId: true },
            },
        },
    });
    return video?.channel?.userProfileId ?? null;
}

/**
 * Check if a user owns a video
 */
export async function isVideoOwner(
    videoId: string,
    userProfileId: string
): Promise<boolean> {
    const ownerId = await getVideoOwnerId(videoId);
    return ownerId === userProfileId;
}

/**
 * Get video statistics for analytics
 */
export async function getVideoStats(videoId: string) {
    return prisma.video.findUnique({
        where: { id: videoId },
        select: {
            viewCount: true,
            likeCount: true,
            dislikeCount: true,
            commentCount: true,
            duration: true,
            uploadedAt: true,
            publishedAt: true,
        },
    });
}

/**
 * Get all videos for a channel (including private, for owner)
 */
export async function getAllChannelVideos(
    channelId: string,
    options: {
        limit?: number;
        offset?: number;
    } = {}
) {
    const { limit = 50, offset = 0 } = options;

    const [videos, total] = await Promise.all([
        prisma.video.findMany({
            where: { channelId },
            orderBy: { uploadedAt: "desc" },
            take: limit,
            skip: offset,
            select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                duration: true,
                viewCount: true,
                likeCount: true,
                dislikeCount: true,
                commentCount: true,
                visibility: true,
                processStatus: true,
                uploadedAt: true,
                publishedAt: true,
            },
        }),
        prisma.video.count({ where: { channelId } }),
    ]);

    return { videos, total };
}

/**
 * Get videos by category
 */
export async function getVideosByCategory(
    category: string,
    limit: number = 20,
    offset: number = 0
) {
    const where = {
        category,
        visibility: "PUBLIC" as VideoVisibility,
        processStatus: "COMPLETED" as VideoProcessStatus,
    };

    const [videos, total] = await Promise.all([
        prisma.video.findMany({
            where,
            orderBy: { viewCount: "desc" },
            take: limit,
            skip: offset,
            include: {
                channel: {
                    select: {
                        id: true,
                        name: true,
                        handle: true,
                        avatar: true,
                        verified: true,
                    },
                },
            },
        }),
        prisma.video.count({ where }),
    ]);

    return { videos, total };
}

/**
 * Get available categories with video counts
 */
export async function getCategories() {
    const categories = await prisma.video.groupBy({
        by: ["category"],
        where: {
            category: { not: null },
            visibility: "PUBLIC",
            processStatus: "COMPLETED",
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
    });

    return categories
        .filter((c) => c.category !== null)
        .map((c) => ({
            name: c.category!,
            count: c._count.id,
        }));
}
