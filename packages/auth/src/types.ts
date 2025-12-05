import { z } from "zod";

// ============================================
// User Role Types
// ============================================

export const UserRole = {
    VIEWER: "VIEWER",
    CREATOR: "CREATOR",
    ADMIN: "ADMIN",
    ADVERTISER: "ADVERTISER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleSchema = z.enum(["VIEWER", "CREATOR", "ADMIN", "ADVERTISER"]);

// ============================================
// Session Types (Extended)
// ============================================

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Session {
    session: {
        id: string;
        userId: string;
        expiresAt: Date;
        token: string;
        createdAt: Date;
        updatedAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
    };
    user: SessionUser;
}

// ============================================
// Extended User Profile (with role)
// ============================================

export interface UserProfile {
    id: string;
    userId: string;
    role: UserRole;
    bio: string | null;
    avatar: string | null;
    banner: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthenticatedUser extends SessionUser {
    profile: UserProfile | null;
}

// ============================================
// Request Context Types
// ============================================

export interface AuthContext {
    user: AuthenticatedUser | null;
    session: Session["session"] | null;
    isAuthenticated: boolean;
}

export interface AuthenticatedContext extends AuthContext {
    user: AuthenticatedUser;
    session: Session["session"];
    isAuthenticated: true;
}

// ============================================
// Permission Types
// ============================================

export type Permission =
    | "video:upload"
    | "video:edit"
    | "video:delete"
    | "channel:create"
    | "channel:edit"
    | "channel:delete"
    | "comment:create"
    | "comment:edit"
    | "comment:delete"
    | "playlist:create"
    | "playlist:edit"
    | "playlist:delete"
    | "admin:moderate"
    | "admin:users"
    | "admin:analytics"
    | "advertiser:campaign";

// Role to permissions mapping
export const RolePermissions: Record<UserRole, Permission[]> = {
    VIEWER: [
        "comment:create",
        "comment:edit",
        "comment:delete",
        "playlist:create",
        "playlist:edit",
        "playlist:delete",
    ],
    CREATOR: [
        "video:upload",
        "video:edit",
        "video:delete",
        "channel:create",
        "channel:edit",
        "channel:delete",
        "comment:create",
        "comment:edit",
        "comment:delete",
        "playlist:create",
        "playlist:edit",
        "playlist:delete",
    ],
    ADMIN: [
        "video:upload",
        "video:edit",
        "video:delete",
        "channel:create",
        "channel:edit",
        "channel:delete",
        "comment:create",
        "comment:edit",
        "comment:delete",
        "playlist:create",
        "playlist:edit",
        "playlist:delete",
        "admin:moderate",
        "admin:users",
        "admin:analytics",
    ],
    ADVERTISER: [
        "comment:create",
        "comment:edit",
        "comment:delete",
        "playlist:create",
        "playlist:edit",
        "playlist:delete",
        "advertiser:campaign",
    ],
};
