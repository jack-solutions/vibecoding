"use client";

import { useCurrentUser, useLogout } from "@/lib/auth/hooks";
import Link from "next/link";

export default function HomePage() {
    const { user, loading } = useCurrentUser();
    const logout = useLogout();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <svg
                                width="90"
                                height="20"
                                viewBox="0 0 90 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 0 14.285 0 14.285 0C14.285 0 5.35042 0 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C0 5.35042 0 10 0 10C0 10 0 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"
                                    fill="#FF0000"
                                />
                                <path
                                    d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z"
                                    fill="white"
                                />
                            </svg>
                            <span className="text-xl font-semibold text-gray-900">YouTube Clone</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            {user?.isAuthenticated ? (
                                <>
                                    {user.role === "creator" && (
                                        <Link
                                            href="/upload"
                                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                        >
                                            Upload
                                        </Link>
                                    )}
                                    {user.role === "advertiser" && (
                                        <Link
                                            href="/ads"
                                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                        >
                                            Ads Manager
                                        </Link>
                                    )}
                                    {user.role === "admin" && (
                                        <Link
                                            href="/admin"
                                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                        >
                                            Admin
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                    >
                                        Create account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Welcome to YouTube Clone
                    </h1>
                    {user?.isAuthenticated ? (
                        <p className="text-lg text-gray-600">
                            Hello, <span className="font-semibold">{user.name}</span>! You're logged in as a{" "}
                            <span className="font-semibold capitalize">{user.role}</span>.
                        </p>
                    ) : (
                        <p className="text-lg text-gray-600">
                            Please sign in to access all features.
                        </p>
                    )}
                </div>

                {/* Role-based content */}
                {user?.isAuthenticated && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Your Profile
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p><span className="font-medium">Email:</span> {user.email}</p>
                                <p><span className="font-medium">Role:</span> {user.role}</p>
                                {user.channelId && (
                                    <p><span className="font-medium">Channel:</span> Created ✓</p>
                                )}
                            </div>
                        </div>

                        {user.role === "creator" && (
                            <div className="bg-blue-50 rounded-lg shadow-sm p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                    Creator Tools
                                </h3>
                                <p className="text-sm text-blue-700 mb-4">
                                    You have access to video upload and channel management.
                                </p>
                                <Link
                                    href="/upload"
                                    className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Go to Upload
                                </Link>
                            </div>
                        )}

                        {user.role === "advertiser" && (
                            <div className="bg-green-50 rounded-lg shadow-sm p-6 border border-green-200">
                                <h3 className="text-lg font-semibold text-green-900 mb-2">
                                    Advertiser Tools
                                </h3>
                                <p className="text-sm text-green-700 mb-4">
                                    Manage your advertising campaigns and analytics.
                                </p>
                                <Link
                                    href="/ads"
                                    className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Go to Ads Manager
                                </Link>
                            </div>
                        )}

                        {user.role === "admin" && (
                            <div className="bg-purple-50 rounded-lg shadow-sm p-6 border border-purple-200">
                                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                                    Admin Tools
                                </h3>
                                <p className="text-sm text-purple-700 mb-4">
                                    Access platform management and analytics.
                                </p>
                                <Link
                                    href="/admin"
                                    className="inline-block px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Go to Dashboard
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Features showcase */}
                <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Phase 2: Authentication Complete ✅
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Implemented Features
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    User registration with role selection
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    JWT authentication with secure cookies
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    Role-based access control
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    Auto-channel creation for creators
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    Protected routes with middleware
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    YouTube-inspired responsive UI
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Available Roles
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">👁</span>
                                    <div>
                                        <span className="font-medium">Viewer:</span> Watch and enjoy videos
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-600 mr-2">🎥</span>
                                    <div>
                                        <span className="font-medium">Creator:</span> Upload and manage videos
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">📊</span>
                                    <div>
                                        <span className="font-medium">Advertiser:</span> Run ad campaigns
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-purple-600 mr-2">⚙️</span>
                                    <div>
                                        <span className="font-medium">Admin:</span> Platform management
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
