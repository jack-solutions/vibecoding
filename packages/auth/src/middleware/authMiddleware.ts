import type { Request, Response, NextFunction } from "express";
import { auth } from "../index";
import prisma from "@vc-yt-clone/db";
import type { AuthContext, AuthenticatedContext, AuthenticatedUser } from "../types";

// Extend Express Request to include auth context
declare global {
    namespace Express {
        interface Request {
            authContext?: AuthContext;
        }
    }
}

// ============================================
// Auth Context Middleware
// ============================================

/**
 * Middleware that attaches auth context to the request.
 * Does NOT require authentication - just attaches user info if available.
 * Use this for routes that work for both authenticated and anonymous users.
 */
export async function attachAuthContext(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Get session from better-auth
        // Cast headers through unknown since Express headers differ from Fetch Headers
        const session = await auth.api.getSession({
            headers: req.headers as unknown as Headers,
        });

        if (!session) {
            req.authContext = {
                user: null,
                session: null,
                isAuthenticated: false,
            };
            return next();
        }

        // Fetch user profile with role
        const userProfile = await prisma.userProfile.findUnique({
            where: { userId: session.user.id },
        });

        const authenticatedUser: AuthenticatedUser = {
            ...session.user,
            profile: userProfile,
        };

        req.authContext = {
            user: authenticatedUser,
            session: {
                id: session.session.id,
                userId: session.session.userId,
                expiresAt: session.session.expiresAt,
                token: session.session.token,
                createdAt: session.session.createdAt,
                updatedAt: session.session.updatedAt,
                ipAddress: session.session.ipAddress ?? null,
                userAgent: session.session.userAgent ?? null,
            },
            isAuthenticated: true,
        };

        next();
    } catch (error) {
        console.error("Auth context error:", error);
        req.authContext = {
            user: null,
            session: null,
            isAuthenticated: false,
        };
        next();
    }
}

// ============================================
// Authentication Required Middleware
// ============================================

/**
 * Middleware that requires authentication.
 * Returns 401 if user is not authenticated.
 */
export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // If auth context not already attached, attach it
        if (!req.authContext) {
            await attachAuthContext(req, res, () => { });
        }

        if (!req.authContext?.isAuthenticated || !req.authContext.user) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Authentication required",
            });
            return;
        }

        next();
    } catch (error) {
        console.error("Auth check error:", error);
        res.status(401).json({
            error: "Unauthorized",
            message: "Authentication failed",
        });
    }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get the authenticated context from request.
 * Throws if not authenticated.
 */
export function getAuthContext(req: Request): AuthenticatedContext {
    const context = req.authContext;

    if (!context?.isAuthenticated || !context.user || !context.session) {
        throw new Error("User is not authenticated");
    }

    return context as AuthenticatedContext;
}

/**
 * Get the current user from request.
 * Returns null if not authenticated.
 */
export function getCurrentUser(req: Request): AuthenticatedUser | null {
    return req.authContext?.user ?? null;
}

/**
 * Check if current request is authenticated.
 */
export function isAuthenticated(req: Request): boolean {
    return req.authContext?.isAuthenticated ?? false;
}
