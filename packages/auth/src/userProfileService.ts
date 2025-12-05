import prisma from "@vc-yt-clone/db";
import { UserRole, type UserProfile } from "./types";

// ============================================
// User Profile Service
// ============================================

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    return prisma.userProfile.findUnique({
        where: { userId },
    });
}

/**
 * Get user profile by profile ID
 */
export async function getUserProfileById(id: string): Promise<UserProfile | null> {
    return prisma.userProfile.findUnique({
        where: { id },
    });
}

/**
 * Create a new user profile with default VIEWER role
 */
export async function createUserProfile(
    userId: string,
    data?: {
        role?: UserRole;
        bio?: string;
        avatar?: string;
        banner?: string;
    }
): Promise<UserProfile> {
    return prisma.userProfile.create({
        data: {
            userId,
            role: data?.role ?? UserRole.VIEWER,
            bio: data?.bio,
            avatar: data?.avatar,
            banner: data?.banner,
        },
    });
}

/**
 * Get or create user profile
 * Creates with VIEWER role if doesn't exist
 */
export async function getOrCreateUserProfile(userId: string): Promise<UserProfile> {
    const existing = await getUserProfile(userId);
    if (existing) return existing;
    return createUserProfile(userId);
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    data: {
        bio?: string;
        avatar?: string;
        banner?: string;
    }
): Promise<UserProfile> {
    return prisma.userProfile.update({
        where: { userId },
        data,
    });
}

/**
 * Upgrade user to Creator role
 * Also creates a channel for the user
 */
export async function upgradeToCreator(
    userId: string,
    channelData: {
        name: string;
        handle: string;
        description?: string;
        avatar?: string;
        banner?: string;
    }
): Promise<{ profile: UserProfile; channel: any }> {
    // Use transaction to ensure both profile update and channel creation succeed
    const result = await prisma.$transaction(async (tx) => {
        // Update profile to CREATOR role
        const profile = await tx.userProfile.update({
            where: { userId },
            data: { role: UserRole.CREATOR },
        });

        // Create channel for the user
        const channel = await tx.channel.create({
            data: {
                userProfileId: profile.id,
                name: channelData.name,
                handle: channelData.handle,
                description: channelData.description,
                avatar: channelData.avatar,
                banner: channelData.banner,
            },
        });

        return { profile, channel };
    });

    return result;
}

/**
 * Check if a handle is available for a new channel
 */
export async function isHandleAvailable(handle: string): Promise<boolean> {
    const existing = await prisma.channel.findUnique({
        where: { handle },
    });
    return !existing;
}

/**
 * Update user role (Admin function)
 */
export async function updateUserRole(
    userId: string,
    role: UserRole
): Promise<UserProfile> {
    return prisma.userProfile.update({
        where: { userId },
        data: { role },
    });
}

/**
 * Delete user profile
 */
export async function deleteUserProfile(userId: string): Promise<void> {
    await prisma.userProfile.delete({
        where: { userId },
    });
}
