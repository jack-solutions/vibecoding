import prisma from "../index";
import type { UserRole } from "../../prisma/generated/client";

// ============================================
// Types
// ============================================

export interface CreateUserProfileInput {
    userId: string;
    role?: UserRole;
    bio?: string;
    avatar?: string;
    banner?: string;
}

export interface UpdateUserProfileInput {
    bio?: string;
    avatar?: string;
    banner?: string;
}

export interface UserWithProfile {
    id: string;
    name: string;
    email: string;
    image: string | null;
    profile: {
        id: string;
        role: UserRole;
        bio: string | null;
        avatar: string | null;
        banner: string | null;
        createdAt: Date;
        updatedAt: Date;
        channel?: {
            id: string;
            name: string;
            handle: string;
        } | null;
    } | null;
}

// ============================================
// Repository Functions
// ============================================

/**
 * Get a user profile by user ID
 */
export async function getUserProfile(userId: string) {
    return prisma.userProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
            channel: {
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    avatar: true,
                    subscriberCount: true,
                    verified: true,
                },
            },
        },
    });
}

/**
 * Get a user profile by profile ID
 */
export async function getUserProfileById(profileId: string) {
    return prisma.userProfile.findUnique({
        where: { id: profileId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
            channel: {
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    avatar: true,
                    subscriberCount: true,
                    verified: true,
                },
            },
        },
    });
}

/**
 * Create a user profile
 */
export async function createUserProfile(input: CreateUserProfileInput) {
    return prisma.userProfile.create({
        data: {
            userId: input.userId,
            role: input.role ?? "VIEWER",
            bio: input.bio,
            avatar: input.avatar,
            banner: input.banner,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });
}

/**
 * Update a user profile
 */
export async function updateUserProfile(
    userId: string,
    input: UpdateUserProfileInput
) {
    return prisma.userProfile.update({
        where: { userId },
        data: {
            bio: input.bio,
            avatar: input.avatar,
            banner: input.banner,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
            channel: {
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    avatar: true,
                    subscriberCount: true,
                    verified: true,
                },
            },
        },
    });
}

/**
 * Upgrade a user to creator role
 * Creates a channel for the user if they don't have one
 */
export async function upgradeToCreator(
    userId: string,
    channelData: {
        name: string;
        handle: string;
        description?: string;
    }
) {
    // Check if handle is already taken
    const existingChannel = await prisma.channel.findUnique({
        where: { handle: channelData.handle },
    });

    if (existingChannel) {
        throw new Error("Channel handle already taken");
    }

    // Get or create user profile
    let userProfile = await prisma.userProfile.findUnique({
        where: { userId },
    });

    if (!userProfile) {
        userProfile = await prisma.userProfile.create({
            data: { userId, role: "CREATOR" },
        });
    } else if (userProfile.role === "CREATOR" || userProfile.role === "ADMIN") {
        // Check if they already have a channel
        const existingUserChannel = await prisma.channel.findUnique({
            where: { userProfileId: userProfile.id },
        });
        if (existingUserChannel) {
            throw new Error("User already has a channel");
        }
    }

    // Update role to CREATOR if not already
    if (userProfile.role !== "CREATOR" && userProfile.role !== "ADMIN") {
        await prisma.userProfile.update({
            where: { id: userProfile.id },
            data: { role: "CREATOR" },
        });
    }

    // Create the channel
    await prisma.channel.create({
        data: {
            userProfileId: userProfile.id,
            name: channelData.name,
            handle: channelData.handle,
            description: channelData.description,
        },
    });

    // Return updated profile with channel
    return prisma.userProfile.findUnique({
        where: { id: userProfile.id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
            channel: true,
        },
    });
}

/**
 * Get a user's role
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
    const profile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { role: true },
    });
    return profile?.role ?? null;
}

/**
 * Check if a user exists
 */
export async function userExists(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });
    return !!user;
}

// NOTE: getUserSubscriptions has been moved to subscriptionRepository.ts
// NOTE: getUserLikedVideos has been moved to likeRepository.ts

/**
 * Get user's watch history
 */
export async function getUserWatchHistory(
    userProfileId: string,
    limit: number = 50,
    offset: number = 0
) {
    return prisma.view.findMany({
        where: { userProfileId },
        include: {
            video: {
                select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                    duration: true,
                    viewCount: true,
                    uploadedAt: true,
                    channel: {
                        select: {
                            id: true,
                            name: true,
                            handle: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
        orderBy: { watchedAt: "desc" },
        take: limit,
        skip: offset,
    });
}
