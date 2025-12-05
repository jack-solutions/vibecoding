import { NextRequest } from "next/server";
import connectDB from "@/lib/db/connect";
import Channel from "@/models/Channel";
import ChannelSubscription from "@/models/ChannelSubscription";
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

        const channel = await Channel.findById(params.id);
        if (!channel) {
            return errorResponse("Channel not found", 404);
        }

        // Check if already subscribed
        const existingSubscription = await ChannelSubscription.findOne({
            channelId: params.id,
            subscriberId: user.userId,
        });

        if (existingSubscription) {
            // Unsubscribe
            await ChannelSubscription.findByIdAndDelete(existingSubscription._id);

            // Update subscriber count
            await Channel.findByIdAndUpdate(params.id, {
                $inc: { subscriberCount: -1 },
            });

            return successResponse("Unsubscribed successfully", {
                action: "unsubscribed",
                subscriberCount: channel.subscriberCount - 1,
            });
        } else {
            // Subscribe
            await ChannelSubscription.create({
                channelId: params.id,
                subscriberId: user.userId,
            });

            // Update subscriber count
            await Channel.findByIdAndUpdate(params.id, {
                $inc: { subscriberCount: 1 },
            });

            return successResponse("Subscribed successfully", {
                action: "subscribed",
                subscriberCount: channel.subscriberCount + 1,
            });
        }
    } catch (err: any) {
        console.error("Subscribe error:", err);
        return errorResponse("Failed to process subscription", 500);
    }
}
