import { Router } from "express";
import type { Router as ExpressRouter, Request, Response } from "express";
import { z } from "zod";
import { requireAuth, getAuthContext } from "@vc-yt-clone/auth";
import {
    createPlaylist,
    getPlaylistById,
    getUserPlaylists,
    getPublicUserPlaylists,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    reorderPlaylistVideos,
    isVideoInPlaylist,
    getPlaylistsContainingVideo,
    getPlaylistOwnerId,
    getOrCreateWatchLaterPlaylist,
    searchPlaylists,
} from "@vc-yt-clone/db";

const router: ExpressRouter = Router();

// ============================================
// Validation Schemas
// ============================================

const createPlaylistSchema = z.object({
    name: z.string().min(1).max(150),
    description: z.string().max(5000).optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
});

const updatePlaylistSchema = z.object({
    name: z.string().min(1).max(150).optional(),
    description: z.string().max(5000).optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
});

const addVideoSchema = z.object({
    videoId: z.string().min(1),
    position: z.number().int().min(0).optional(),
});

const reorderSchema = z.object({
    videoId: z.string().min(1),
    newPosition: z.number().int().min(0),
});

// ============================================
// Routes
// ============================================

/**
 * GET /api/playlist/search
 * Search public playlists
 */
router.get("/search", async (req: Request, res: Response) => {
    try {
        const { q, limit = "20", offset = "0" } = req.query;

        if (!q || typeof q !== "string") {
            res.status(400).json({
                success: false,
                message: "Search query is required",
            });
            return;
        }

        const result = await searchPlaylists(
            q,
            parseInt(limit as string, 10),
            parseInt(offset as string, 10)
        );

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Search playlists error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search playlists",
        });
    }
});

/**
 * GET /api/playlist/my
 * Get current user's playlists
 */
router.get("/my", requireAuth, async (req: Request, res: Response) => {
    try {
        const context = getAuthContext(req);
        const userProfileId = context.user.profile?.id;

        if (!userProfileId) {
            res.status(401).json({
                success: false,
                message: "User profile not found",
            });
            return;
        }

        const { limit = "20", offset = "0", sortBy = "newest" } = req.query;

        const result = await getUserPlaylists(userProfileId, {
            limit: parseInt(limit as string, 10),
            offset: parseInt(offset as string, 10),
            sortBy: sortBy as "newest" | "oldest" | "name" | "updated",
        });

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Get my playlists error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get playlists",
        });
    }
});

/**
 * GET /api/playlist/watch-later
 * Get or create Watch Later playlist
 */
router.get("/watch-later", requireAuth, async (req: Request, res: Response) => {
    try {
        const context = getAuthContext(req);
        const userProfileId = context.user.profile?.id;

        if (!userProfileId) {
            res.status(401).json({
                success: false,
                message: "User profile not found",
            });
            return;
        }

        const playlist = await getOrCreateWatchLaterPlaylist(userProfileId);
        const fullPlaylist = await getPlaylistById(playlist.id);

        res.json({
            success: true,
            data: fullPlaylist,
        });
    } catch (error) {
        console.error("Get watch later error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get Watch Later playlist",
        });
    }
});

/**
 * GET /api/playlist/user/:userId
 * Get public playlists for a user
 */
router.get("/user/:userId", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { limit = "20", offset = "0" } = req.query;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required",
            });
            return;
        }

        const result = await getPublicUserPlaylists(
            userId,
            parseInt(limit as string, 10),
            parseInt(offset as string, 10)
        );

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Get user playlists error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get playlists",
        });
    }
});

/**
 * GET /api/playlist/video/:videoId
 * Get playlists containing a video
 */
router.get("/video/:videoId", requireAuth, async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        const context = getAuthContext(req);
        const userProfileId = context.user.profile?.id;

        if (!videoId) {
            res.status(400).json({
                success: false,
                message: "Video ID is required",
            });
            return;
        }

        const playlists = await getPlaylistsContainingVideo(videoId, userProfileId);

        res.json({
            success: true,
            data: playlists,
        });
    } catch (error) {
        console.error("Get playlists for video error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get playlists",
        });
    }
});

/**
 * POST /api/playlist
 * Create a new playlist
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
    try {
        const context = getAuthContext(req);
        const userProfileId = context.user.profile?.id;

        if (!userProfileId) {
            res.status(401).json({
                success: false,
                message: "User profile not found",
            });
            return;
        }

        const validation = createPlaylistSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Invalid input",
                errors: validation.error.issues,
            });
            return;
        }

        const { name, description, visibility } = validation.data;

        const playlist = await createPlaylist({
            userProfileId,
            name,
            description,
            visibility,
        });

        res.status(201).json({
            success: true,
            message: "Playlist created",
            data: playlist,
        });
    } catch (error) {
        console.error("Create playlist error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create playlist",
        });
    }
});

/**
 * GET /api/playlist/:id
 * Get a playlist by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: "Playlist ID is required",
            });
            return;
        }

        const playlist = await getPlaylistById(id);

        if (!playlist) {
            res.status(404).json({
                success: false,
                message: "Playlist not found",
            });
            return;
        }

        // Check visibility
        if (playlist.visibility !== "PUBLIC") {
            try {
                const context = getAuthContext(req);
                if (playlist.userProfile.id !== context.user.profile?.id) {
                    res.status(404).json({
                        success: false,
                        message: "Playlist not found",
                    });
                    return;
                }
            } catch {
                res.status(404).json({
                    success: false,
                    message: "Playlist not found",
                });
                return;
            }
        }

        res.json({
            success: true,
            data: playlist,
        });
    } catch (error) {
        console.error("Get playlist error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get playlist",
        });
    }
});

/**
 * PATCH /api/playlist/:id
 * Update a playlist
 */
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const context = getAuthContext(req);
        const userProfileId = context.user.profile?.id;

        if (!id) {
            res.status(400).json({
                success: false,
                message: "Playlist ID is required",
            });
            return;
        }

        // Check ownership
        const ownerId = await getPlaylistOwnerId(id);
        if (!ownerId || ownerId !== userProfileId) {
            res.status(403).json({
                success: false,
                message: "Not authorized to update this playlist",
            });
            return;
        }

        const validation = updatePlaylistSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Invalid input",
                errors: validation.error.issues,
            });
            return;
        }

        const playlist = await updatePlaylist(id, validation.data);

        res.json({
            success: true,
            message: "Playlist updated",
            data: playlist,
        });
    } catch (error) {
        console.error("Update playlist error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update playlist",
        });
    }
});

/**
 * DELETE /api/playlist/:id
 * Delete a playlist
 */
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const context = getAuthContext(req);
        const userProfileId = context.user.profile?.id;

        if (!id) {
            res.status(400).json({
                success: false,
                message: "Playlist ID is required",
            });
            return;
        }

        // Check ownership
        const ownerId = await getPlaylistOwnerId(id);
        if (!ownerId || ownerId !== userProfileId) {
            res.status(403).json({
                success: false,
                message: "Not authorized to delete this playlist",
            });
            return;
        }

        await deletePlaylist(id);

        res.json({
            success: true,
            message: "Playlist deleted",
        });
    } catch (error) {
        console.error("Delete playlist error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete playlist",
        });
    }
});

/**
 * POST /api/playlist/:id/videos
 * Add a video to a playlist
 */
router.post("/:id/videos", requireAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const context = getAuthContext(req);
        const userProfileId = context.user.profile?.id;

        if (!id) {
            res.status(400).json({
                success: false,
                message: "Playlist ID is required",
            });
            return;
        }

        // Check ownership
        const ownerId = await getPlaylistOwnerId(id);
        if (!ownerId || ownerId !== userProfileId) {
            res.status(403).json({
                success: false,
                message: "Not authorized to add videos to this playlist",
            });
            return;
        }

        const validation = addVideoSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Invalid input",
                errors: validation.error.issues,
            });
            return;
        }

        const { videoId, position } = validation.data;

        // Check if video is already in playlist
        const alreadyInPlaylist = await isVideoInPlaylist(id, videoId);
        if (alreadyInPlaylist) {
            res.status(400).json({
                success: false,
                message: "Video is already in playlist",
            });
            return;
        }

        const playlistVideo = await addVideoToPlaylist(id, videoId, position);

        res.status(201).json({
            success: true,
            message: "Video added to playlist",
            data: playlistVideo,
        });
    } catch (error) {
        console.error("Add video to playlist error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add video to playlist",
        });
    }
});

/**
 * DELETE /api/playlist/:id/videos/:videoId
 * Remove a video from a playlist
 */
router.delete(
    "/:id/videos/:videoId",
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            const { id, videoId } = req.params;
            const context = getAuthContext(req);
            const userProfileId = context.user.profile?.id;

            if (!id || !videoId) {
                res.status(400).json({
                    success: false,
                    message: "Playlist ID and Video ID are required",
                });
                return;
            }

            // Check ownership
            const ownerId = await getPlaylistOwnerId(id);
            if (!ownerId || ownerId !== userProfileId) {
                res.status(403).json({
                    success: false,
                    message: "Not authorized to remove videos from this playlist",
                });
                return;
            }

            await removeVideoFromPlaylist(id, videoId);

            res.json({
                success: true,
                message: "Video removed from playlist",
            });
        } catch (error) {
            console.error("Remove video from playlist error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to remove video from playlist",
            });
        }
    }
);

/**
 * PUT /api/playlist/:id/reorder
 * Reorder videos in a playlist
 */
router.put("/:id/reorder", requireAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const context = getAuthContext(req);
        const userProfileId = context.user.profile?.id;

        if (!id) {
            res.status(400).json({
                success: false,
                message: "Playlist ID is required",
            });
            return;
        }

        // Check ownership
        const ownerId = await getPlaylistOwnerId(id);
        if (!ownerId || ownerId !== userProfileId) {
            res.status(403).json({
                success: false,
                message: "Not authorized to reorder this playlist",
            });
            return;
        }

        const validation = reorderSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Invalid input",
                errors: validation.error.issues,
            });
            return;
        }

        const { videoId, newPosition } = validation.data;

        await reorderPlaylistVideos(id, videoId, newPosition);

        res.json({
            success: true,
            message: "Playlist reordered",
        });
    } catch (error) {
        console.error("Reorder playlist error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reorder playlist",
        });
    }
});

/**
 * GET /api/playlist/:id/check/:videoId
 * Check if a video is in a playlist
 */
router.get(
    "/:id/check/:videoId",
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            const { id, videoId } = req.params;

            if (!id || !videoId) {
                res.status(400).json({
                    success: false,
                    message: "Playlist ID and Video ID are required",
                });
                return;
            }

            const isInPlaylist = await isVideoInPlaylist(id, videoId);

            res.json({
                success: true,
                data: { isInPlaylist },
            });
        } catch (error) {
            console.error("Check video in playlist error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to check video in playlist",
            });
        }
    }
);

export default router;
