import { NextRequest } from "next/server";
import connectDB from "@/lib/db/connect";
import Video from "@/models/Video";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Get trending videos (most views in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendingVideos = await Video.find({
            visibility: "public",
            processingStatus: "ready",
            uploadDate: { $gte: sevenDaysAgo },
        })
            .sort({ views: -1 })
            .limit(50)
            .populate("creatorId", "name avatar")
            .populate("channelId", "name handle avatar subscriberCount");

        return successResponse("Trending videos retrieved", {
            videos: trendingVideos,
            count: trendingVideos.length,
        });
    } catch (err: any) {
        console.error("Trending videos error:", err);
        return errorResponse("Failed to retrieve trending videos", 500);
    }
}
