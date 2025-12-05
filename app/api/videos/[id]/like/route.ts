import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Video from "@/models/Video";
import VideoLike from "@/models/VideoLike";
import { requireAuth } from "@/middleware/auth";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user, error } = requireAuth(req);
        if (error) return error;

        await connectDB();

        const body = await req.json();
        const { type } = body; // "like" or "dislike"

        if (!type || !["like", "dislike"].includes(type)) {
            return errorResponse("Invalid type. Must be 'like' or 'dislike'", 400);
        }

        const video = await Video.findById(params.id);
        if (!video) {
            return errorResponse("Video not found", 404);
        }

        // Check if user already liked/disliked
        const existingLike = await VideoLike.findOne({
            videoId: params.id,
            userId: user.userId,
        });

        if (existingLike) {
            if (existingLike.type === type) {
                // Remove like/dislike (toggle off)
                await VideoLike.findByIdAndDelete(existingLike._id);

                // Update video counts
                if (type === "like") {
                    await Video.findByIdAndUpdate(params.id, { $inc: { likes: -1 } });
                } else {
                    await Video.findByIdAndUpdate(params.id, { $inc: { dislikes: -1 } });
                }

                return successResponse("Removed " + type, { action: "removed", type });
            } else {
                // Switch from like to dislike or vice versa
                const oldType = existingLike.type;
                existingLike.type = type;
                await existingLike.save();

                // Update counts
                if (type === "like") {
                    await Video.findByIdAndUpdate(params.id, {
                        $inc: { likes: 1, dislikes: -1 },
                    });
                } else {
                    await Video.findByIdAndUpdate(params.id, {
                        $inc: { likes: -1, dislikes: 1 },
                    });
                }

                return successResponse("Changed to " + type, {
                    action: "switched",
                    from: oldType,
                    to: type,
                });
            }
        } else {
            // Create new like/dislike
            await VideoLike.create({
                videoId: params.id,
                userId: user.userId,
                type,
            });

            // Update video counts
            if (type === "like") {
                await Video.findByIdAndUpdate(params.id, { $inc: { likes: 1 } });
            } else {
                await Video.findByIdAndUpdate(params.id, { $inc: { dislikes: 1 } });
            }

            return successResponse("Added " + type, { action: "added", type });
        }
    } catch (err: any) {
        console.error("Like/dislike error:", err);
        return errorResponse("Failed to process request", 500);
    }
}
