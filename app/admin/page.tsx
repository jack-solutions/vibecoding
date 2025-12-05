"use client";

import { useRequireRole } from "@/lib/auth/hooks";

export default function AdminDashboard() {
    const { user, loading } = useRequireRole("admin");

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600 mb-8">
                        Welcome, <span className="font-medium">{user?.name}</span>! This page is only accessible to administrators.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                            <h3 className="text-sm font-medium text-blue-900 mb-1">Total Users</h3>
                            <p className="text-3xl font-bold text-blue-700">0</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                            <h3 className="text-sm font-medium text-green-900 mb-1">Total Videos</h3>
                            <p className="text-3xl font-bold text-green-700">0</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                            <h3 className="text-sm font-medium text-purple-900 mb-1">Total Channels</h3>
                            <p className="text-3xl font-bold text-purple-700">0</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                            <h3 className="text-sm font-medium text-orange-900 mb-1">Active Ads</h3>
                            <p className="text-3xl font-bold text-orange-700">0</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                System Management
                            </h2>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• User Management (Phase 3+)</li>
                                <li>• Content Moderation (Phase 4+)</li>
                                <li>• Analytics Dashboard (Phase 6+)</li>
                                <li>• System Settings (Future)</li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Recent Activity
                            </h2>
                            <p className="text-sm text-gray-500">
                                No recent activity to display
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">
                            ✅ Protected Route Example
                        </h3>
                        <p className="text-sm text-blue-700">
                            This page uses <code className="bg-blue-100 px-1 rounded">useRequireRole("admin")</code> to ensure only users with the admin role can access it.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
