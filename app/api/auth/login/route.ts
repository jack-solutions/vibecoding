import { NextRequest } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import { comparePassword } from "@/lib/auth/password";
import { signToken, getTokenExpirationSeconds } from "@/lib/auth/jwt";
import {
    successResponse,
    errorResponse,
    validationError,
    serverError,
    unauthorizedResponse,
} from "@/lib/utils/api-response";
import {
    isValidEmail,
    sanitizeInput,
    validateRequiredFields,
} from "@/lib/utils/validation";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const { email, password } = body;

        // Validate required fields
        const { isValid, missingFields } = validateRequiredFields(body, [
            "email",
            "password",
        ]);

        if (!isValid) {
            return validationError(
                "Missing required fields",
                [`Missing: ${missingFields.join(", ")}`]
            );
        }

        // Sanitize email
        const sanitizedEmail = sanitizeInput(email.toLowerCase());

        // Validate email format
        if (!isValidEmail(sanitizedEmail)) {
            return validationError("Invalid email format");
        }

        // Find user by email (include password field)
        const user = await User.findOne({ email: sanitizedEmail }).select("+password");

        if (!user) {
            // Use generic message to prevent user enumeration
            return unauthorizedResponse("Invalid email or password");
        }

        // Compare passwords
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            // Use generic message to prevent user enumeration
            return unauthorizedResponse("Invalid email or password");
        }

        // Generate JWT token
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            channelId: user.channelId?.toString(),
        });

        // Create response with user data
        const response = successResponse("Login successful", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                channelId: user.channelId,
                createdAt: user.createdAt,
            },
        });

        // Set JWT in httpOnly cookie
        const maxAge = getTokenExpirationSeconds();
        response.cookies.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge,
            path: "/",
        });

        return response;
    } catch (error: any) {
        console.error("Login error:", error);
        return serverError(error.message || "Failed to login");
    }
}
