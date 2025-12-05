import { NextRequest } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import Channel from "@/models/Channel";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { signToken, getTokenExpirationSeconds } from "@/lib/auth/jwt";
import {
    successResponse,
    errorResponse,
    validationError,
    serverError,
} from "@/lib/utils/api-response";
import {
    isValidEmail,
    isValidName,
    isValidRole,
    sanitizeInput,
    validateRequiredFields,
    generateHandleFromName,
} from "@/lib/utils/validation";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const { name, email, password, role = "viewer", avatar } = body;

        // Validate required fields
        const { isValid, missingFields } = validateRequiredFields(body, [
            "name",
            "email",
            "password",
        ]);

        if (!isValid) {
            return validationError(
                "Missing required fields",
                [`Missing: ${missingFields.join(", ")}`]
            );
        }

        // Sanitize inputs
        const sanitizedName = sanitizeInput(name);
        const sanitizedEmail = sanitizeInput(email.toLowerCase());

        // Validate name
        if (!isValidName(sanitizedName)) {
            return validationError("Name must be between 2 and 50 characters");
        }

        // Validate email
        if (!isValidEmail(sanitizedEmail)) {
            return validationError("Invalid email format");
        }

        // Validate role
        if (!isValidRole(role)) {
            return validationError("Invalid role. Must be: admin, creator, viewer, or advertiser");
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return validationError(passwordValidation.message);
        }

        // Check for duplicate user
        const existingUser = await User.findOne({ email: sanitizedEmail });
        if (existingUser) {
            return errorResponse("User with this email already exists", undefined, 409);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await User.create({
            name: sanitizedName,
            email: sanitizedEmail,
            password: hashedPassword,
            role,
            avatar: avatar || "",
        });

        // Auto-create channel if user is a creator
        let channel = null;
        if (role === "creator") {
            const handle = generateHandleFromName(sanitizedName);

            channel = await Channel.create({
                name: `${sanitizedName}'s Channel`,
                handle,
                description: "",
                ownerId: user._id,
            });

            // Update user with channelId
            user.channelId = channel._id;
            await user.save();
        }

        // Generate JWT token
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            channelId: user.channelId?.toString(),
        });

        // Create response with user data
        const response = successResponse(
            "User registered successfully",
            {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                    channelId: user.channelId,
                    createdAt: user.createdAt,
                },
                channel: channel ? {
                    id: channel._id,
                    name: channel.name,
                    handle: channel.handle,
                } : null,
            },
            201
        );

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
        console.error("Registration error:", error);
        return serverError(error.message || "Failed to register user");
    }
}
