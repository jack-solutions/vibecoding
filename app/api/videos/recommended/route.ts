import { NextRequest } from "next/server";
import connectDB from "@/lib/db/connect";
import Video from "@/models/Video";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "20");

        // Simple recommendation: popular recent videos
        const recommendedVideos = await Video.find({
            visibility: "public",
            processingStatus: "ready",
        })
            .sort({ views: -1, uploadDate: -1 })
            .limit(limit)
            .populate("creatorId", "name avatar")
            .populate("channelId", "name handle avatar subscriberCount");

        return successResponse("Recommended videos retrieved", {
            videos: recommendedVideos,
            count: recommendedVideos.length,
        });
    } catch (err: any) {
        console.error("Recommended videos error:", err);
        return errorResponse("Failed to retrieve recommended videos", 500);
    }
}
