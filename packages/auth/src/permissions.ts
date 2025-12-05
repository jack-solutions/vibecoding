import {
    UserRole,
    RolePermissions,
    type Permission,
    type UserProfile,
} from "./types";

// ============================================
// Permission Checking Utilities
// ============================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = RolePermissions[role];
    return permissions?.includes(permission) ?? false;
}

/**
 * Check if a role has all specified permissions
 */
export function hasAllPermissions(
    role: UserRole,
    permissions: Permission[]
): boolean {
    return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
    role: UserRole,
    permissions: Permission[]
): boolean {
    return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
    return RolePermissions[role] ?? [];
}

// ============================================
// Role Checking Utilities
// ============================================

/**
 * Check if user has a specific role
 */
export function hasRole(profile: UserProfile | null, role: UserRole): boolean {
    return profile?.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
    profile: UserProfile | null,
    roles: UserRole[]
): boolean {
    if (!profile) return false;
    return roles.includes(profile.role);
}

/**
 * Check if user is at least a specific role level
 * Role hierarchy: VIEWER < CREATOR < ADMIN
 * ADVERTISER is separate (not in hierarchy)
 */
export function isAtLeastRole(
    profile: UserProfile | null,
    minimumRole: UserRole
): boolean {
    if (!profile) return false;

    const roleHierarchy: Record<UserRole, number> = {
        VIEWER: 1,
        CREATOR: 2,
        ADMIN: 3,
        ADVERTISER: 1, // Same level as viewer for hierarchy purposes
    };

    return roleHierarchy[profile.role] >= roleHierarchy[minimumRole];
}

// ============================================
// Convenience Role Checks
// ============================================

export function isViewer(profile: UserProfile | null): boolean {
    return hasRole(profile, UserRole.VIEWER);
}

export function isCreator(profile: UserProfile | null): boolean {
    return hasRole(profile, UserRole.CREATOR);
}

export function isAdmin(profile: UserProfile | null): boolean {
    return hasRole(profile, UserRole.ADMIN);
}

export function isAdvertiser(profile: UserProfile | null): boolean {
    return hasRole(profile, UserRole.ADVERTISER);
}

/**
 * Check if user can upload videos (Creator or Admin)
 */
export function canUploadVideos(profile: UserProfile | null): boolean {
    return hasAnyRole(profile, [UserRole.CREATOR, UserRole.ADMIN]);
}

/**
 * Check if user can manage a channel (must own it or be admin)
 */
export function canManageChannel(
    profile: UserProfile | null,
    channelOwnerId: string
): boolean {
    if (!profile) return false;
    if (isAdmin(profile)) return true;
    return profile.id === channelOwnerId;
}

/**
 * Check if user can moderate content (Admin only)
 */
export function canModerate(profile: UserProfile | null): boolean {
    return isAdmin(profile);
}

/**
 * Check if user can manage ad campaigns (Advertiser or Admin)
 */
export function canManageAds(profile: UserProfile | null): boolean {
    return hasAnyRole(profile, [UserRole.ADVERTISER, UserRole.ADMIN]);
}
