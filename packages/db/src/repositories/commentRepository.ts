import prisma from "../index";
import { incrementVideoMetric } from "./analyticsRepository";

// ============================================
// Types
// ============================================

export interface CreateCommentInput {
    videoId: string;
    userProfileId: string;
    content: string;
    parentCommentId?: string;
}

export interface UpdateCommentInput {
    content: string;
}

export interface CommentWithUser {
    id: string;
    content: string;
    likeCount: number;
    replyCount: number;
    isEdited: boolean;
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
    userProfile: {
        id: string;
        avatar: string | null;
        user: {
            name: string | null;
        };
        channel: {
            handle: string;
        } | null;
    };
    parentCommentId: string | null;
}

export interface CommentListOptions {
    limit?: number;
    offset?: number;
    sortBy?: "newest" | "oldest" | "popular";
}

// ============================================
// Repository Functions
// ============================================

/**
 * Get a comment by ID
 */
export async function getCommentById(commentId: string) {
    return prisma.comment.findUnique({
        where: { id: commentId },
        include: {
            userProfile: {
                select: {
                    id: true,
                    avatar: true,
                    user: {
                        select: { name: true },
                    },
                    channel: {
                        select: { handle: true },
                    },
                },
            },
            video: {
                select: {
                    id: true,
                    title: true,
                    channel: {
                        select: {
                            id: true,
                            userProfileId: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Create a new comment
 */
export async function createComment(input: CreateCommentInput) {
    const comment = await prisma.comment.create({
        data: {
            videoId: input.videoId,
            userProfileId: input.userProfileId,
            content: input.content,
            parentCommentId: input.parentCommentId,
        },
        include: {
            userProfile: {
                select: {
                    id: true,
                    avatar: true,
                    user: {
                        select: { name: true },
                    },
                    channel: {
                        select: { handle: true },
                    },
                },
            },
        },
    });

    // Update video comment count
    await prisma.video.update({
        where: { id: input.videoId },
        data: { commentCount: { increment: 1 } },
    });

    // Update analytics
    incrementVideoMetric(input.videoId, "comments", 1).catch(console.error);

    // Update parent comment reply count if it's a reply
    if (input.parentCommentId) {
        await prisma.comment.update({
            where: { id: input.parentCommentId },
            data: { replyCount: { increment: 1 } },
        });
    }

    return comment;
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, input: UpdateCommentInput) {
    return prisma.comment.update({
        where: { id: commentId },
        data: {
            content: input.content,
            isEdited: true,
        },
        include: {
            userProfile: {
                select: {
                    id: true,
                    avatar: true,
                    user: {
                        select: { name: true },
                    },
                    channel: {
                        select: { handle: true },
                    },
                },
            },
        },
    });
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: {
            videoId: true,
            parentCommentId: true,
            replyCount: true,
        },
    });

    if (!comment) {
        throw new Error("Comment not found");
    }

    // Use transaction to update counts and delete
    await prisma.$transaction(async (tx) => {
        // Delete all replies first
        await tx.comment.deleteMany({
            where: { parentCommentId: commentId },
        });

        // Delete the comment
        await tx.comment.delete({
            where: { id: commentId },
        });

        // Update video comment count (subtract this comment + its replies)
        await tx.video.update({
            where: { id: comment.videoId },
            data: { commentCount: { decrement: 1 + comment.replyCount } },
        });

        // Update parent's reply count if this was a reply
        if (comment.parentCommentId) {
            await tx.comment.update({
                where: { id: comment.parentCommentId },
                data: { replyCount: { decrement: 1 } },
            });
        }
    });

    // Update analytics (decrement by total deleted: 1 + replies)
    incrementVideoMetric(comment.videoId, "comments", -(1 + comment.replyCount)).catch(console.error);
}

/**
 * Get comments for a video (top-level only)
 */
export async function getVideoComments(
    videoId: string,
    options: CommentListOptions = {}
) {
    const { limit = 20, offset = 0, sortBy = "newest" } = options;

    let orderBy: any;
    switch (sortBy) {
        case "oldest":
            orderBy = { createdAt: "asc" };
            break;
        case "popular":
            orderBy = { likeCount: "desc" };
            break;
        case "newest":
        default:
            orderBy = { createdAt: "desc" };
    }

    const where = {
        videoId,
        parentCommentId: null, // Only top-level comments
    };

    const [comments, total] = await Promise.all([
        prisma.comment.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset,
            include: {
                userProfile: {
                    select: {
                        id: true,
                        avatar: true,
                        user: {
                            select: { name: true },
                        },
                        channel: {
                            select: { handle: true },
                        },
                    },
                },
            },
        }),
        prisma.comment.count({ where }),
    ]);

    return { comments, total };
}

/**
 * Get replies to a comment
 */
export async function getCommentReplies(
    parentCommentId: string,
    options: CommentListOptions = {}
) {
    const { limit = 10, offset = 0, sortBy = "oldest" } = options;

    let orderBy: any;
    switch (sortBy) {
        case "newest":
            orderBy = { createdAt: "desc" };
            break;
        case "popular":
            orderBy = { likeCount: "desc" };
            break;
        case "oldest":
        default:
            orderBy = { createdAt: "asc" };
    }

    const where = { parentCommentId };

    const [replies, total] = await Promise.all([
        prisma.comment.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset,
            include: {
                userProfile: {
                    select: {
                        id: true,
                        avatar: true,
                        user: {
                            select: { name: true },
                        },
                        channel: {
                            select: { handle: true },
                        },
                    },
                },
            },
        }),
        prisma.comment.count({ where }),
    ]);

    return { replies, total };
}

/**
 * Pin a comment (only video owner can do this)
 */
export async function pinComment(commentId: string) {
    // First unpin any existing pinned comment for this video
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { videoId: true },
    });

    if (!comment) {
        throw new Error("Comment not found");
    }

    await prisma.comment.updateMany({
        where: { videoId: comment.videoId, isPinned: true },
        data: { isPinned: false },
    });

    return prisma.comment.update({
        where: { id: commentId },
        data: { isPinned: true },
    });
}

/**
 * Unpin a comment
 */
export async function unpinComment(commentId: string) {
    return prisma.comment.update({
        where: { id: commentId },
        data: { isPinned: false },
    });
}

/**
 * Check if a user owns a comment
 */
export async function isCommentOwner(
    commentId: string,
    userProfileId: string
): Promise<boolean> {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { userProfileId: true },
    });
    return comment?.userProfileId === userProfileId;
}

/**
 * Get the video owner's profile ID for a comment
 */
export async function getCommentVideoOwner(
    commentId: string
): Promise<string | null> {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: {
            video: {
                select: {
                    channel: {
                        select: { userProfileId: true },
                    },
                },
            },
        },
    });
    return comment?.video?.channel?.userProfileId ?? null;
}

/**
 * Increment like count on a comment
 */
export async function incrementCommentLikeCount(commentId: string) {
    return prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
    });
}

/**
 * Decrement like count on a comment
 */
export async function decrementCommentLikeCount(commentId: string) {
    return prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
    });
}
