import prisma from "../index";
import type { VideoVisibility } from "../../prisma/generated/client";

// ============================================
// Types
// ============================================

export interface CreatePlaylistInput {
    userProfileId: string;
    name: string;
    description?: string;
    visibility?: VideoVisibility;
}

export interface UpdatePlaylistInput {
    name?: string;
    description?: string;
    visibility?: VideoVisibility;
}

export interface PlaylistWithVideos {
    id: string;
    name: string;
    description: string | null;
    visibility: VideoVisibility;
    videoCount: number;
    createdAt: Date;
    updatedAt: Date;
    userProfile: {
        id: string;
        userId: string;
        user: {
            name: string;
            image: string | null;
        };
    };
    videos: {
        id: string;
        position: number;
        addedAt: Date;
        video: {
            id: string;
            title: string;
            thumbnailUrl: string | null;
            duration: number;
            viewCount: number;
            channel: {
                id: string;
                name: string;
                handle: string;
            };
        };
    }[];
}

export interface PlaylistListOptions {
    limit?: number;
    offset?: number;
    visibility?: VideoVisibility;
    sortBy?: "newest" | "oldest" | "name" | "updated";
}

// ============================================
// Repository Functions
// ============================================

/**
 * Create a new playlist
 */
export async function createPlaylist(input: CreatePlaylistInput) {
    const { userProfileId, name, description, visibility = "PRIVATE" } = input;

    return prisma.playlist.create({
        data: {
            userProfileId,
            name,
            description,
            visibility,
        },
        include: {
            userProfile: {
                select: {
                    id: true,
                    userId: true,
                    user: {
                        select: {
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
 * Get a playlist by ID with all videos
 */
export async function getPlaylistById(
    playlistId: string
): Promise<PlaylistWithVideos | null> {
    return prisma.playlist.findUnique({
        where: { id: playlistId },
        include: {
            userProfile: {
                select: {
                    id: true,
                    userId: true,
                    user: {
                        select: {
                            name: true,
                            image: true,
                        },
                    },
                },
            },
            videos: {
                orderBy: { position: "asc" },
                include: {
                    video: {
                        select: {
                            id: true,
                            title: true,
                            thumbnailUrl: true,
                            duration: true,
                            viewCount: true,
                            channel: {
                                select: {
                                    id: true,
                                    name: true,
                                    handle: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    }) as Promise<PlaylistWithVideos | null>;
}

/**
 * Get playlists for a user
 */
export async function getUserPlaylists(
    userProfileId: string,
    options: PlaylistListOptions = {}
) {
    const {
        limit = 20,
        offset = 0,
        visibility,
        sortBy = "newest",
    } = options;

    const where: any = { userProfileId };
    if (visibility) {
        where.visibility = visibility;
    }

    let orderBy: any;
    switch (sortBy) {
        case "oldest":
            orderBy = { createdAt: "asc" };
            break;
        case "name":
            orderBy = { name: "asc" };
            break;
        case "updated":
            orderBy = { updatedAt: "desc" };
            break;
        case "newest":
        default:
            orderBy = { createdAt: "desc" };
    }

    const [playlists, total] = await Promise.all([
        prisma.playlist.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset,
            include: {
                userProfile: {
                    select: {
                        id: true,
                        userId: true,
                        user: {
                            select: {
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
                videos: {
                    take: 4, // Get first 4 videos for thumbnail grid
                    orderBy: { position: "asc" },
                    select: {
                        video: {
                            select: {
                                id: true,
                                thumbnailUrl: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.playlist.count({ where }),
    ]);

    return { playlists, total };
}

/**
 * Get public playlists for a user (for visitors)
 */
export async function getPublicUserPlaylists(
    userProfileId: string,
    limit: number = 20,
    offset: number = 0
) {
    return getUserPlaylists(userProfileId, {
        limit,
        offset,
        visibility: "PUBLIC",
    });
}

/**
 * Update a playlist
 */
export async function updatePlaylist(
    playlistId: string,
    input: UpdatePlaylistInput
) {
    return prisma.playlist.update({
        where: { id: playlistId },
        data: input,
        include: {
            userProfile: {
                select: {
                    id: true,
                    userId: true,
                    user: {
                        select: {
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
 * Delete a playlist
 */
export async function deletePlaylist(playlistId: string) {
    return prisma.playlist.delete({
        where: { id: playlistId },
    });
}

/**
 * Add a video to a playlist
 */
export async function addVideoToPlaylist(
    playlistId: string,
    videoId: string,
    position?: number
) {
    // Get the current max position
    const maxPositionResult = await prisma.playlistVideo.aggregate({
        where: { playlistId },
        _max: { position: true },
    });

    const newPosition = position ?? (maxPositionResult._max.position ?? -1) + 1;

    // If a specific position is provided, shift other videos
    if (position !== undefined) {
        await prisma.playlistVideo.updateMany({
            where: {
                playlistId,
                position: { gte: position },
            },
            data: {
                position: { increment: 1 },
            },
        });
    }

    // Add the video
    const playlistVideo = await prisma.playlistVideo.create({
        data: {
            playlistId,
            videoId,
            position: newPosition,
        },
        include: {
            video: {
                select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                    duration: true,
                    viewCount: true,
                    channel: {
                        select: {
                            id: true,
                            name: true,
                            handle: true,
                        },
                    },
                },
            },
        },
    });

    // Update playlist video count
    await prisma.playlist.update({
        where: { id: playlistId },
        data: {
            videoCount: { increment: 1 },
        },
    });

    return playlistVideo;
}

/**
 * Remove a video from a playlist
 */
export async function removeVideoFromPlaylist(
    playlistId: string,
    videoId: string
) {
    // Get the video's current position
    const playlistVideo = await prisma.playlistVideo.findUnique({
        where: {
            playlistId_videoId: {
                playlistId,
                videoId,
            },
        },
    });

    if (!playlistVideo) {
        throw new Error("Video not in playlist");
    }

    // Delete the video from playlist
    await prisma.playlistVideo.delete({
        where: {
            playlistId_videoId: {
                playlistId,
                videoId,
            },
        },
    });

    // Shift positions of videos after the deleted one
    await prisma.playlistVideo.updateMany({
        where: {
            playlistId,
            position: { gt: playlistVideo.position },
        },
        data: {
            position: { decrement: 1 },
        },
    });

    // Update playlist video count
    await prisma.playlist.update({
        where: { id: playlistId },
        data: {
            videoCount: { decrement: 1 },
        },
    });

    return { success: true };
}

/**
 * Reorder videos in a playlist
 */
export async function reorderPlaylistVideos(
    playlistId: string,
    videoId: string,
    newPosition: number
) {
    const playlistVideo = await prisma.playlistVideo.findUnique({
        where: {
            playlistId_videoId: {
                playlistId,
                videoId,
            },
        },
    });

    if (!playlistVideo) {
        throw new Error("Video not in playlist");
    }

    const oldPosition = playlistVideo.position;

    if (oldPosition === newPosition) {
        return playlistVideo;
    }

    // Shift other videos
    if (newPosition < oldPosition) {
        // Moving up: shift videos between new and old position down
        await prisma.playlistVideo.updateMany({
            where: {
                playlistId,
                position: { gte: newPosition, lt: oldPosition },
            },
            data: {
                position: { increment: 1 },
            },
        });
    } else {
        // Moving down: shift videos between old and new position up
        await prisma.playlistVideo.updateMany({
            where: {
                playlistId,
                position: { gt: oldPosition, lte: newPosition },
            },
            data: {
                position: { decrement: 1 },
            },
        });
    }

    // Update the video's position
    return prisma.playlistVideo.update({
        where: {
            playlistId_videoId: {
                playlistId,
                videoId,
            },
        },
        data: {
            position: newPosition,
        },
    });
}

/**
 * Check if a video is in a playlist
 */
export async function isVideoInPlaylist(
    playlistId: string,
    videoId: string
): Promise<boolean> {
    const playlistVideo = await prisma.playlistVideo.findUnique({
        where: {
            playlistId_videoId: {
                playlistId,
                videoId,
            },
        },
    });

    return playlistVideo !== null;
}

/**
 * Get playlists containing a specific video
 */
export async function getPlaylistsContainingVideo(
    videoId: string,
    userProfileId?: string
) {
    const where: any = {
        videos: {
            some: { videoId },
        },
    };

    if (userProfileId) {
        where.userProfileId = userProfileId;
    } else {
        where.visibility = "PUBLIC";
    }

    return prisma.playlist.findMany({
        where,
        select: {
            id: true,
            name: true,
            visibility: true,
            videoCount: true,
        },
    });
}

/**
 * Get the owner's user profile ID for a playlist
 */
export async function getPlaylistOwnerId(
    playlistId: string
): Promise<string | null> {
    const playlist = await prisma.playlist.findUnique({
        where: { id: playlistId },
        select: { userProfileId: true },
    });

    return playlist?.userProfileId ?? null;
}

/**
 * Check if a user owns a playlist
 */
export async function isPlaylistOwner(
    playlistId: string,
    userProfileId: string
): Promise<boolean> {
    const ownerId = await getPlaylistOwnerId(playlistId);
    return ownerId === userProfileId;
}

/**
 * Get "Watch Later" playlist for a user, creating it if it doesn't exist
 */
export async function getOrCreateWatchLaterPlaylist(userProfileId: string) {
    // Check if watch later playlist exists
    let watchLater = await prisma.playlist.findFirst({
        where: {
            userProfileId,
            name: "Watch Later",
        },
    });

    if (!watchLater) {
        watchLater = await prisma.playlist.create({
            data: {
                userProfileId,
                name: "Watch Later",
                description: "Videos to watch later",
                visibility: "PRIVATE",
            },
        });
    }

    return watchLater;
}

/**
 * Get "Liked Videos" playlist for a user, creating it if it doesn't exist
 */
export async function getOrCreateLikedVideosPlaylist(userProfileId: string) {
    // Check if liked videos playlist exists
    let likedVideos = await prisma.playlist.findFirst({
        where: {
            userProfileId,
            name: "Liked Videos",
        },
    });

    if (!likedVideos) {
        likedVideos = await prisma.playlist.create({
            data: {
                userProfileId,
                name: "Liked Videos",
                description: "Your liked videos",
                visibility: "PRIVATE",
            },
        });
    }

    return likedVideos;
}

/**
 * Search playlists
 */
export async function searchPlaylists(
    query: string,
    limit: number = 20,
    offset: number = 0
) {
    const where = {
        visibility: "PUBLIC" as VideoVisibility,
        OR: [
            { name: { contains: query } },
            { description: { contains: query } },
        ],
    };

    const [playlists, total] = await Promise.all([
        prisma.playlist.findMany({
            where,
            orderBy: { videoCount: "desc" },
            take: limit,
            skip: offset,
            include: {
                userProfile: {
                    select: {
                        id: true,
                        userId: true,
                        user: {
                            select: {
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
                videos: {
                    take: 4,
                    orderBy: { position: "asc" },
                    select: {
                        video: {
                            select: {
                                id: true,
                                thumbnailUrl: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.playlist.count({ where }),
    ]);

    return { playlists, total };
}
