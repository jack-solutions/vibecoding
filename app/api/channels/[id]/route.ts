import { NextRequest } from "next/server";
import connectDB from "@/lib/db/connect";
import Channel from "@/models/Channel";
import Video from "@/models/Video";
import ChannelSubscription from "@/models/ChannelSubscription";
import { requireAuth } from "@/middleware/auth";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const channel = await Channel.findById(params.id).populate("ownerId", "name avatar");

        if (!channel) {
            return errorResponse("Channel not found", 404);
        }

        // Get recent videos
        const recentVideos = await Video.find({
            channelId: params.id,
            visibility: "public",
        })
            .sort({ uploadDate: -1 })
            .limit(12);

        // Check if current user is subscribed (if authenticated)
        let isSubscribed = false;
        const authHeader = req.headers.get("cookie");
        if (authHeader) {
            try {
                const { user } = await import("@/middleware/auth").then(m => m.requireAuth(req));
                if (user && !user.error) {
                    const subscription = await ChannelSubscription.findOne({
                        channelId: params.id,
                        subscriberId: user.userId,
                    });
                    isSubscribed = !!subscription;
                }
            } catch (e) {
                // User not authenticated, that's fine
            }
        }

        return successResponse("Channel retrieved successfully", {
            channel: {
                ...channel.toObject(),
                isSubscribed,
            },
            videos: recentVideos,
        });
    } catch (err: any) {
        console.error("Get channel error:", err);
        return errorResponse("Failed to retrieve channel", 500);
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user, error } = await import("@/middleware/auth").then(m => m.requireAuth(req));
        if (error) return error;

        await connectDB();

        const channel = await Channel.findById(params.id);
        if (!channel) {
            return errorResponse("Channel not found", 404);
        }

        // Check ownership
        if (channel.ownerId.toString() !== user.userId) {
            return errorResponse("Unauthorized", 403);
        }

        const body = await req.json();
        const { name, description, banner, avatar } = body;

        if (name) channel.name = name;
        if (description !== undefined) channel.description = description;
        if (banner) channel.banner = banner;
        if (avatar) channel.avatar = avatar;

        await channel.save();

        return successResponse("Channel updated successfully", { channel });
    } catch (err: any) {
        console.error("Update channel error:", err);
        return errorResponse("Failed to update channel", 500);
    }
}
