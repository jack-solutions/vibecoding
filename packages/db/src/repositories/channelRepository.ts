import prisma from "../index";
import type { VideoVisibility } from "../../prisma/generated/client";

// ============================================
// Types
// ============================================

export interface CreateChannelInput {
    userProfileId: string;
    name: string;
    handle: string;
    description?: string;
    avatar?: string;
    banner?: string;
}

export interface UpdateChannelInput {
    name?: string;
    description?: string;
    avatar?: string;
    banner?: string;
}

export interface ChannelWithStats {
    id: string;
    name: string;
    handle: string;
    description: string | null;
    avatar: string | null;
    banner: string | null;
    subscriberCount: number;
    totalViews: number;
    videoCount: number;
    verified: boolean;
    createdAt: Date;
}

// ============================================
// Repository Functions
// ============================================

/**
 * Get a channel by ID
 */
export async function getChannelById(channelId: string) {
    return prisma.channel.findUnique({
        where: { id: channelId },
        include: {
            userProfile: {
                select: {
                    id: true,
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Get a channel by handle
 */
export async function getChannelByHandle(handle: string) {
    return prisma.channel.findUnique({
        where: { handle },
        include: {
            userProfile: {
                select: {
                    id: true,
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Get a channel by user profile ID
 */
export async function getChannelByUserProfileId(userProfileId: string) {
    return prisma.channel.findUnique({
        where: { userProfileId },
    });
}

/**
 * Get a channel by user ID (auth user ID)
 */
export async function getChannelByUserId(userId: string) {
    const userProfile = await prisma.userProfile.findUnique({
        where: { userId },
        include: {
            channel: true,
        },
    });
    return userProfile?.channel ?? null;
}

/**
 * Create a new channel
 */
export async function createChannel(input: CreateChannelInput) {
    // Check if handle is already taken
    const existingChannel = await prisma.channel.findUnique({
        where: { handle: input.handle },
    });

    if (existingChannel) {
        throw new Error("Channel handle already taken");
    }

    // Check if user already has a channel
    const existingUserChannel = await prisma.channel.findUnique({
        where: { userProfileId: input.userProfileId },
    });

    if (existingUserChannel) {
        throw new Error("User already has a channel");
    }

    return prisma.channel.create({
        data: {
            userProfileId: input.userProfileId,
            name: input.name,
            handle: input.handle,
            description: input.description,
            avatar: input.avatar,
            banner: input.banner,
        },
    });
}

/**
 * Update a channel
 */
export async function updateChannel(
    channelId: string,
    input: UpdateChannelInput
) {
    return prisma.channel.update({
        where: { id: channelId },
        data: {
            name: input.name,
            description: input.description,
            avatar: input.avatar,
            banner: input.banner,
        },
    });
}

/**
 * Delete a channel
 */
export async function deleteChannel(channelId: string) {
    return prisma.channel.delete({
        where: { id: channelId },
    });
}

/**
 * Check if a handle is available
 */
export async function isHandleAvailable(handle: string): Promise<boolean> {
    const channel = await prisma.channel.findUnique({
        where: { handle },
        select: { id: true },
    });
    return !channel;
}

/**
 * Get channel videos
 */
export async function getChannelVideos(
    channelId: string,
    options: {
        limit?: number;
        offset?: number;
        visibility?: VideoVisibility;
        sortBy?: "newest" | "oldest" | "popular";
    } = {}
) {
    const { limit = 20, offset = 0, visibility, sortBy = "newest" } = options;

    const where: any = { channelId };

    if (visibility) {
        where.visibility = visibility;
    }

    const orderBy: any = {};
    switch (sortBy) {
        case "oldest":
            orderBy.uploadedAt = "asc";
            break;
        case "popular":
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
            select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                duration: true,
                viewCount: true,
                likeCount: true,
                visibility: true,
                uploadedAt: true,
                publishedAt: true,
            },
        }),
        prisma.video.count({ where }),
    ]);

    return { videos, total };
}

/**
 * Get channel subscriber count
 */
export async function getSubscriberCount(channelId: string): Promise<number> {
    return prisma.subscription.count({
        where: { channelId },
    });
}

// NOTE: Subscription functions (isSubscribed, subscribe, unsubscribe, getChannelSubscribers)
// have been moved to subscriptionRepository.ts for better organization

/**
 * Search channels by name or handle
 */
export async function searchChannels(
    query: string,
    limit: number = 20,
    offset: number = 0
) {
    return prisma.channel.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { handle: { contains: query } },
            ],
        },
        orderBy: { subscriberCount: "desc" },
        take: limit,
        skip: offset,
        select: {
            id: true,
            name: true,
            handle: true,
            description: true,
            avatar: true,
            subscriberCount: true,
            verified: true,
        },
    });
}

/**
 * Get popular channels
 */
export async function getPopularChannels(limit: number = 10) {
    return prisma.channel.findMany({
        orderBy: { subscriberCount: "desc" },
        take: limit,
        select: {
            id: true,
            name: true,
            handle: true,
            description: true,
            avatar: true,
            subscriberCount: true,
            verified: true,
        },
    });
}

/**
 * Get the owner's user profile ID for a channel
 */
export async function getChannelOwnerId(channelId: string): Promise<string | null> {
    const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        select: { userProfileId: true },
    });
    return channel?.userProfileId ?? null;
}

/**
 * Update channel statistics (usually called after video operations)
 */
export async function updateChannelStats(channelId: string) {
    const [videoStats, subscriberCount] = await Promise.all([
        prisma.video.aggregate({
            where: { channelId, visibility: "PUBLIC" },
            _count: { id: true },
            _sum: { viewCount: true },
        }),
        prisma.subscription.count({ where: { channelId } }),
    ]);

    return prisma.channel.update({
        where: { id: channelId },
        data: {
            videoCount: videoStats._count.id || 0,
            totalViews: videoStats._sum.viewCount || 0,
            subscriberCount,
        },
    });
}
