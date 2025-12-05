import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "@/lib/auth/jwt";

export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload;
}

/**
 * Authentication middleware
 * Verifies JWT token from cookies and injects user data into request
 * @param req - Next.js request object
 * @returns Modified request with user data or null if not authenticated
 */
export function authenticate(req: NextRequest): JWTPayload | null {
    try {
        // Get token from cookie
        const token = req.cookies.get("auth-token")?.value;

        if (!token) {
            return null;
        }

        // Verify and decode token
        const decoded = verifyToken(token);

        if (!decoded) {
            return null;
        }

        return decoded;
    } catch (error) {
        console.error("Authentication error:", error);
        return null;
    }
}

/**
 * Require authentication middleware
 * Returns 401 response if user is not authenticated
 */
export function requireAuth(req: NextRequest): {
    user: JWTPayload | null;
    error: NextResponse | null;
} {
    const user = authenticate(req);

    if (!user) {
        return {
            user: null,
            error: NextResponse.json(
                {
                    success: false,
                    message: "Authentication required. Please login.",
                },
                { status: 401 }
            ),
        };
    }

    return { user, error: null };
}

/**
 * Require specific role(s) middleware
 * Returns 403 response if user doesn't have required role
 */
export function requireRole(
    req: NextRequest,
    allowedRoles: string | string[]
): {
    user: JWTPayload | null;
    error: NextResponse | null;
} {
    const { user, error } = requireAuth(req);

    if (error) {
        return { user: null, error };
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (user && !roles.includes(user.role)) {
        return {
            user: null,
            error: NextResponse.json(
                {
                    success: false,
                    message: `Access forbidden. Required role(s): ${roles.join(", ")}`,
                },
                { status: 403 }
            ),
        };
    }

    return { user, error: null };
}

/**
 * Check if user has permission to access resource
 * @param user - Current user from JWT
 * @param resourceOwnerId - Owner ID of the resource
 * @returns true if user has access, false otherwise
 */
export function canAccessResource(
    user: JWTPayload,
    resourceOwnerId: string
): boolean {
    // Admins can access everything
    if (user.role === "admin") {
        return true;
    }

    // Users can access their own resources
    return user.userId === resourceOwnerId;
}
