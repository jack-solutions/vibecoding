"use client";

import { useRequireRole } from "@/lib/auth/hooks";
import Link from "next/link";

export default function AdsManagerPage() {
    const { user, loading } = useRequireRole("advertiser");

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
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Ads Manager</h1>
                    <p className="text-gray-600 mb-6">
                        Welcome, <span className="font-medium">{user?.name}</span>! This page is only accessible to advertisers.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                            <h3 className="text-sm font-medium text-blue-900 mb-1">Total Campaigns</h3>
                            <p className="text-3xl font-bold text-blue-700">0</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                            <h3 className="text-sm font-medium text-green-900 mb-1">Active Ads</h3>
                            <p className="text-3xl font-bold text-green-700">0</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                            <h3 className="text-sm font-medium text-purple-900 mb-1">Total Impressions</h3>
                            <p className="text-3xl font-bold text-purple-700">0</p>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                            Ad management functionality will be implemented in Phase 7
                        </p>
                    </div>

                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">
                            ✅ Protected Route Example
                        </h3>
                        <p className="text-sm text-blue-700">
                            This page uses <code className="bg-blue-100 px-1 rounded">useRequireRole("advertiser")</code> to ensure only users with the advertiser role can access it.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
