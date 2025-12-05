import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Video from "@/models/Video";
import Channel from "@/models/Channel";
import { requireRole } from "@/middleware/auth";
import { uploadVideoFile, generateThumbnail } from "@/lib/utils/upload";
import { successResponse, errorResponse, validationError } from "@/lib/utils/api-response";

export async function POST(req: NextRequest) {
    try {
        // Require creator role
        const { user, error } = requireRole(req, "creator");
        if (error) return error;

        await connectDB();

        const formData = await req.formData();
        const videoFile = formData.get("video") as File;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
        const tags = formData.get("tags") as string;
        const visibility = formData.get("visibility") as string;

        // Validation
        if (!videoFile || !title) {
            return validationError("Video file and title are required");
        }

        if (title.length < 3 || title.length > 100) {
            return validationError("Title must be 3-100 characters");
        }

        // Get user's channel
        const channel = await Channel.findOne({ ownerId: user.userId });
        if (!channel) {
            return errorResponse("Channel not found. Please create a channel first.", 404);
        }

        // Upload video (mock implementation)
        const { videoUrl, fileSize, duration, resolution } = await uploadVideoFile(videoFile);

        // Generate thumbnail
        const thumbnailUrl = await generateThumbnail(videoUrl);

        // Parse tags
        const tagArray = tags ? tags.split(",").map(tag => tag.trim()).filter(Boolean) : [];

        // Create video document
        const video = await Video.create({
            title,
            description: description || "",
            creatorId: user.userId,
            channelId: channel._id,
            videoUrl,
            thumbnailUrl,
            duration,
            fileSize,
            resolution,
            category: category || "General",
            tags: tagArray,
            visibility: visibility || "public",
            processingStatus: "ready",
        });

        // Update channel video count
        await Channel.findByIdAndUpdate(channel._id, {
            $inc: { videoCount: 1 },
        });

        return successResponse("Video uploaded successfully", {
            video: {
                id: video._id,
                title: video.title,
                videoUrl: video.videoUrl,
                thumbnailUrl: video.thumbnailUrl,
            },
        }, 201);
    } catch (err: any) {
        console.error("Video upload error:", err);
        return errorResponse("Failed to upload video", 500);
    }
}
