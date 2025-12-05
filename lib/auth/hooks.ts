"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface User {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    role: string;
    channelId?: string;
    isAuthenticated: boolean;
    createdAt?: string;
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch("/api/auth/me");
            const data = await response.json();

            if (data.success && data.data.user) {
                setUser(data.data.user);
            } else {
                setUser({ role: "guest", isAuthenticated: false });
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            setUser({ role: "guest", isAuthenticated: false });
        } finally {
            setLoading(false);
        }
    };

    const refetch = () => {
        setLoading(true);
        fetchCurrentUser();
    };

    return { user, loading, refetch };
}

/**
 * Hook to logout user
 */
export function useLogout() {
    const router = useRouter();

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return logout;
}

/**
 * Hook to require authentication and specific role
 * Redirects to login if not authenticated or to home if role doesn't match
 */
export function useRequireRole(allowedRoles: string | string[]) {
    const { user, loading } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            if (!user.isAuthenticated) {
                router.push("/login");
            } else {
                const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
                if (!roles.includes(user.role)) {
                    router.push("/home");
                }
            }
        }
    }, [user, loading, allowedRoles, router]);

    return { user, loading };
}

/**
 * Hook to require authentication (any authenticated user)
 */
export function useRequireAuth() {
    const { user, loading } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user && !user.isAuthenticated) {
            router.push("/login");
        }
    }, [user, loading, router]);

    return { user, loading };
}
