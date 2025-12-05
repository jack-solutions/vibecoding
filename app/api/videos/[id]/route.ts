import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Video from "@/models/Video";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const video = await Video.findById(params.id)
            .populate("creatorId", "name avatar")
            .populate("channelId", "name handle avatar subscriberCount");

        if (!video) {
            return errorResponse("Video not found", 404);
        }

        // Only show public videos or creator's own videos
        if (video.visibility !== "public") {
            // Check if user is the creator (would need auth check here)
            // For now, return error for non-public videos
            return errorResponse("Video not found", 404);
        }

        return successResponse("Video retrieved successfully", { video });
    } catch (err: any) {
        console.error("Get video error:", err);
        return errorResponse("Failed to retrieve video", 500);
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user, error } = await import("@/middleware/auth").then(m => m.requireRole(req, "creator"));
        if (error) return error;

        await connectDB();

        const video = await Video.findById(params.id);
        if (!video) {
            return errorResponse("Video not found", 404);
        }

        // Check ownership
        if (video.creatorId.toString() !== user.userId) {
            return errorResponse("Unauthorized", 403);
        }

        const body = await req.json();
        const { title, description, category, tags, visibility } = body;

        // Update fields
        if (title) video.title = title;
        if (description !== undefined) video.description = description;
        if (category) video.category = category;
        if (tags) video.tags = tags;
        if (visibility) video.visibility = visibility;

        await video.save();

        return successResponse("Video updated successfully", { video });
    } catch (err: any) {
        console.error("Update video error:", err);
        return errorResponse("Failed to update video", 500);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user, error } = await import("@/middleware/auth").then(m => m.requireRole(req, "creator"));
        if (error) return error;

        await connectDB();

        const video = await Video.findById(params.id);
        if (!video) {
            return errorResponse("Video not found", 404);
        }

        // Check ownership
        if (video.creatorId.toString() !== user.userId) {
            return errorResponse("Unauthorized", 403);
        }

        // Delete video
        await Video.findByIdAndDelete(params.id);

        // Update channel video count
        await import("@/models/Channel").then(m =>
            m.default.findByIdAndUpdate(video.channelId, {
                $inc: { videoCount: -1 },
            })
        );

        return successResponse("Video deleted successfully");
    } catch (err: any) {
        console.error("Delete video error:", err);
        return errorResponse("Failed to delete video", 500);
    }
}
