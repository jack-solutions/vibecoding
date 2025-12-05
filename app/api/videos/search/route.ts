import { NextRequest } from "next/server";
import connectDB from "@/lib/db/connect";
import Video from "@/models/Video";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = parseInt(searchParams.get("skip") || "0");

        if (!query) {
            return errorResponse("Search query is required", 400);
        }

        // Text search using MongoDB text index
        const videos = await Video.find({
            $text: { $search: query },
            visibility: "public",
            processingStatus: "ready",
        })
            .sort({ score: { $meta: "textScore" }, views: -1 })
            .skip(skip)
            .limit(limit)
            .populate("creatorId", "name avatar")
            .populate("channelId", "name handle avatar subscriberCount");

        const total = await Video.countDocuments({
            $text: { $search: query },
            visibility: "public",
            processingStatus: "ready",
        });

        return successResponse("Search results retrieved", {
            videos,
            total,
            query,
            hasMore: skip + videos.length < total,
        });
    } catch (err: any) {
        console.error("Search error:", err);
        return errorResponse("Failed to search videos", 500);
    }
}
