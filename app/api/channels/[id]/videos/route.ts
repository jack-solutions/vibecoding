import { NextRequest } from "next/server";
import connectDB from "@/lib/db/connect";
import Video from "@/models/Video";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const sort = searchParams.get("sort") || "newest"; // newest or popular
        const limit = parseInt(searchParams.get("limit") || "30");
        const skip = parseInt(searchParams.get("skip") || "0");

        let sortQuery: any = { uploadDate: -1 }; // newest by default
        if (sort === "popular") {
            sortQuery = { views: -1 };
        }

        const videos = await Video.find({
            channelId: params.id,
            visibility: "public",
        })
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .populate("creatorId", "name avatar");

        const total = await Video.countDocuments({
            channelId: params.id,
            visibility: "public",
        });

        return successResponse("Channel videos retrieved", {
            videos,
            total,
            hasMore: skip + videos.length < total,
        });
    } catch (err: any) {
        console.error("Get channel videos error:", err);
        return errorResponse("Failed to retrieve channel videos", 500);
    }
}
