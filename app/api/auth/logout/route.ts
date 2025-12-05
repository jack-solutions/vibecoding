import { NextRequest } from "next/server";
import { successResponse } from "@/lib/utils/api-response";

export async function POST(req: NextRequest) {
    // Create response
    const response = successResponse("Logged out successfully");

    // Clear auth cookie
    response.cookies.delete("auth-token");

    return response;
}
