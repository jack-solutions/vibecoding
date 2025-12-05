import type { Request, Response, NextFunction } from "express";
import { requireAuth, getAuthContext } from "./authMiddleware";
import { UserRole, type Permission } from "../types";
import {
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    isAdmin,
} from "../permissions";

// ============================================
// Role-Based Guards
// ============================================

/**
 * Middleware factory that requires a specific role.
 */
export function requireRole(role: UserRole) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // First ensure user is authenticated
        await requireAuth(req, res, () => { });

        if (res.headersSent) return;

        try {
            const context = getAuthContext(req);

            if (!hasRole(context.user.profile, role)) {
                res.status(403).json({
                    error: "Forbidden",
                    message: `This action requires the ${role} role`,
                });
                return;
            }

            next();
        } catch (error) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Authentication required",
            });
        }
    };
}

/**
 * Middleware factory that requires any of the specified roles.
 */
export function requireAnyRole(roles: UserRole[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await requireAuth(req, res, () => { });

        if (res.headersSent) return;

        try {
            const context = getAuthContext(req);

            if (!hasAnyRole(context.user.profile, roles)) {
                res.status(403).json({
                    error: "Forbidden",
                    message: `This action requires one of these roles: ${roles.join(", ")}`,
                });
                return;
            }

            next();
        } catch (error) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Authentication required",
            });
        }
    };
}

// ============================================
// Permission-Based Guards
// ============================================

/**
 * Middleware factory that requires a specific permission.
 */
export function requirePermission(permission: Permission) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await requireAuth(req, res, () => { });

        if (res.headersSent) return;

        try {
            const context = getAuthContext(req);
            const role = context.user.profile?.role;

            if (!role || !hasPermission(role, permission)) {
                res.status(403).json({
                    error: "Forbidden",
                    message: `You don't have permission to: ${permission}`,
                });
                return;
            }

            next();
        } catch (error) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Authentication required",
            });
        }
    };
}

/**
 * Middleware factory that requires any of the specified permissions.
 */
export function requireAnyPermission(permissions: Permission[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await requireAuth(req, res, () => { });

        if (res.headersSent) return;

        try {
            const context = getAuthContext(req);
            const role = context.user.profile?.role;

            if (!role || !hasAnyPermission(role, permissions)) {
                res.status(403).json({
                    error: "Forbidden",
                    message: `You need one of these permissions: ${permissions.join(", ")}`,
                });
                return;
            }

            next();
        } catch (error) {
            res.status(401).json({
                error: "Unauthorized",
                message: "Authentication required",
            });
        }
    };
}

// ============================================
// Convenience Role Guards
// ============================================

/**
 * Middleware that requires VIEWER role or higher.
 * Essentially just requires authentication with a profile.
 */
export const requireViewer = requireAnyRole([
    UserRole.VIEWER,
    UserRole.CREATOR,
    UserRole.ADMIN,
    UserRole.ADVERTISER,
]);

/**
 * Middleware that requires CREATOR role.
 */
export const requireCreator = requireAnyRole([UserRole.CREATOR, UserRole.ADMIN]);

/**
 * Middleware that requires ADMIN role.
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Middleware that requires ADVERTISER role.
 */
export const requireAdvertiser = requireAnyRole([UserRole.ADVERTISER, UserRole.ADMIN]);

// ============================================
// Resource Ownership Guard
// ============================================

/**
 * Factory for middleware that checks resource ownership.
 * Admins automatically have access.
 */
export function requireOwnershipOrAdmin(
    getOwnerId: (req: Request) => Promise<string | null>
) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await requireAuth(req, res, () => { });

        if (res.headersSent) return;

        try {
            const context = getAuthContext(req);

            // Admins have access to everything
            if (isAdmin(context.user.profile)) {
                return next();
            }

            const ownerId = await getOwnerId(req);

            if (!ownerId) {
                res.status(404).json({
                    error: "Not Found",
                    message: "Resource not found",
                });
                return;
            }

            // Check if current user's profile ID matches owner ID
            if (context.user.profile?.id !== ownerId) {
                res.status(403).json({
                    error: "Forbidden",
                    message: "You don't have permission to access this resource",
                });
                return;
            }

            next();
        } catch (error) {
            console.error("Ownership check error:", error);
            res.status(500).json({
                error: "Internal Server Error",
                message: "Failed to verify ownership",
            });
        }
    };
}
