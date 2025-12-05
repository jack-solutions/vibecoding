import { NextRequest } from "next/server";
import connectDB from "@/lib/db/connect";
import Video from "@/models/Video";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const video = await Video.findById(params.id);
        if (!video) {
            return errorResponse("Video not found", 404);
        }

        // Increment view count
        await Video.findByIdAndUpdate(params.id, {
            $inc: { views: 1 },
        });

        return successResponse("View recorded", {
            views: video.views + 1,
        });
    } catch (err: any) {
        console.error("View increment error:", err);
        return errorResponse("Failed to record view", 500);
    }
}
