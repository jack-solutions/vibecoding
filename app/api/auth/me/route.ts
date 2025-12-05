import { NextRequest } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth/jwt";
import {
    successResponse,
    serverError,
} from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
    try {
        // Get token from cookie
        const token = req.cookies.get("auth-token")?.value;

        // If no token, return guest user
        if (!token) {
            return successResponse("Guest user", {
                user: {
                    role: "guest",
                    isAuthenticated: false,
                },
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            // Token is invalid or expired, return guest
            return successResponse("Guest user", {
                user: {
                    role: "guest",
                    isAuthenticated: false,
                },
            });
        }

        // Connect to database and fetch user
        await connectDB();
        const user = await User.findById(decoded.userId);

        if (!user) {
            // User not found, return guest
            return successResponse("Guest user", {
                user: {
                    role: "guest",
                    isAuthenticated: false,
                },
            });
        }

        // Return authenticated user data
        return successResponse("User authenticated", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                channelId: user.channelId,
                createdAt: user.createdAt,
                isAuthenticated: true,
            },
        });
    } catch (error: any) {
        console.error("Get current user error:", error);
        return serverError(error.message || "Failed to get current user");
    }
}
