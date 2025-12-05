import prisma from "../index";
import type { LikeType } from "../../prisma/generated/client";
import { incrementVideoMetric } from "./analyticsRepository";

// ============================================
// Types
// ============================================

export interface LikeInput {
    userProfileId: string;
    videoId: string;
    type: LikeType;
}

export interface UserLikeStatus {
    hasLiked: boolean;
    hasDisliked: boolean;
    likeType: LikeType | null;
}

// ============================================
// Repository Functions
// ============================================

/**
 * Get a like by user and video
 */
export async function getLike(userProfileId: string, videoId: string) {
    return prisma.like.findUnique({
        where: {
            userProfileId_videoId: {
                userProfileId,
                videoId,
            },
        },
    });
}

/**
 * Get user's like status for a video
 */
export async function getUserLikeStatus(
    userProfileId: string,
    videoId: string
): Promise<UserLikeStatus> {
    const like = await getLike(userProfileId, videoId);

    if (!like) {
        return {
            hasLiked: false,
            hasDisliked: false,
            likeType: null,
        };
    }

    return {
        hasLiked: like.type === "LIKE",
        hasDisliked: like.type === "DISLIKE",
        likeType: like.type,
    };
}

/**
 * Like a video
 */
export async function likeVideo(userProfileId: string, videoId: string) {
    const existingLike = await getLike(userProfileId, videoId);

    // If already liked, do nothing
    if (existingLike?.type === "LIKE") {
        return { action: "none", like: existingLike };
    }

    // If disliked, change to like
    if (existingLike?.type === "DISLIKE") {
        const like = await prisma.like.update({
            where: { id: existingLike.id },
            data: { type: "LIKE" },
        });

        // Update video counts: +1 like, -1 dislike
        await prisma.video.update({
            where: { id: videoId },
            data: {
                likeCount: { increment: 1 },
                dislikeCount: { decrement: 1 },
            },
        });

        // Update analytics
        Promise.all([
            incrementVideoMetric(videoId, "likes", 1),
            incrementVideoMetric(videoId, "dislikes", -1),
        ]).catch(console.error);

        return { action: "changed", like };
    }

    // Create new like
    const like = await prisma.like.create({
        data: {
            userProfileId,
            videoId,
            type: "LIKE",
        },
    });

    // Update video like count
    await prisma.video.update({
        where: { id: videoId },
        data: { likeCount: { increment: 1 } },
    });

    // Update analytics
    incrementVideoMetric(videoId, "likes", 1).catch(console.error);

    return { action: "created", like };
}

/**
 * Dislike a video
 */
export async function dislikeVideo(userProfileId: string, videoId: string) {
    const existingLike = await getLike(userProfileId, videoId);

    // If already disliked, do nothing
    if (existingLike?.type === "DISLIKE") {
        return { action: "none", like: existingLike };
    }

    // If liked, change to dislike
    if (existingLike?.type === "LIKE") {
        const like = await prisma.like.update({
            where: { id: existingLike.id },
            data: { type: "DISLIKE" },
        });

        // Update video counts: -1 like, +1 dislike
        await prisma.video.update({
            where: { id: videoId },
            data: {
                likeCount: { decrement: 1 },
                dislikeCount: { increment: 1 },
            },
        });

        // Update analytics
        Promise.all([
            incrementVideoMetric(videoId, "likes", -1),
            incrementVideoMetric(videoId, "dislikes", 1),
        ]).catch(console.error);

        return { action: "changed", like };
    }

    // Create new dislike
    const like = await prisma.like.create({
        data: {
            userProfileId,
            videoId,
            type: "DISLIKE",
        },
    });

    // Update video dislike count
    await prisma.video.update({
        where: { id: videoId },
        data: { dislikeCount: { increment: 1 } },
    });

    // Update analytics
    incrementVideoMetric(videoId, "dislikes", 1).catch(console.error);

    return { action: "created", like };
}

/**
 * Remove like/dislike from a video
 */
export async function removeLike(userProfileId: string, videoId: string) {
    const existingLike = await getLike(userProfileId, videoId);

    if (!existingLike) {
        return { action: "none" };
    }

    // Delete the like
    await prisma.like.delete({
        where: { id: existingLike.id },
    });

    // Update video counts
    if (existingLike.type === "LIKE") {
        await prisma.video.update({
            where: { id: videoId },
            data: { likeCount: { decrement: 1 } },
        });
    } else {
        await prisma.video.update({
            where: { id: videoId },
            data: { dislikeCount: { decrement: 1 } },
        });
    }

    // Update analytics
    incrementVideoMetric(videoId, existingLike.type === "LIKE" ? "likes" : "dislikes", -1).catch(console.error);

    return { action: "removed", previousType: existingLike.type };
}

/**
 * Get user's liked videos
 */
export async function getUserLikedVideos(
    userProfileId: string,
    limit: number = 20,
    offset: number = 0
) {
    const where = {
        userProfileId,
        type: "LIKE" as LikeType,
        video: {
            visibility: "PUBLIC" as const,
            processStatus: "COMPLETED" as const,
        },
    };

    const [likes, total] = await Promise.all([
        prisma.like.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
            include: {
                video: {
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
                },
            },
        }),
        prisma.like.count({ where }),
    ]);

    return {
        videos: likes.map((like) => ({
            ...like.video,
            likedAt: like.createdAt,
        })),
        total,
    };
}

/**
 * Check if user has liked a video
 */
export async function hasUserLikedVideo(
    userProfileId: string,
    videoId: string
): Promise<boolean> {
    const like = await getLike(userProfileId, videoId);
    return like?.type === "LIKE";
}

/**
 * Check if user has disliked a video
 */
export async function hasUserDislikedVideo(
    userProfileId: string,
    videoId: string
): Promise<boolean> {
    const like = await getLike(userProfileId, videoId);
    return like?.type === "DISLIKE";
}

/**
 * Get like counts for a video
 */
export async function getVideoLikeCounts(videoId: string) {
    const [likes, dislikes] = await Promise.all([
        prisma.like.count({
            where: { videoId, type: "LIKE" },
        }),
        prisma.like.count({
            where: { videoId, type: "DISLIKE" },
        }),
    ]);

    return { likes, dislikes };
}
