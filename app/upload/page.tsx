"use client";

import { useRequireRole } from "@/lib/auth/hooks";

export default function UploadPage() {
    const { user, loading } = useRequireRole("creator");

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
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Video</h1>
                    <p className="text-gray-600 mb-6">
                        Welcome, <span className="font-medium">{user?.name}</span>! This page is only accessible to creators.
                    </p>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                            Video upload functionality will be implemented in Phase 3
                        </p>
                    </div>

                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">
                            ✅ Protected Route Example
                        </h3>
                        <p className="text-sm text-blue-700">
                            This page uses <code className="bg-blue-100 px-1 rounded">useRequireRole("creator")</code> to ensure only users with the creator role can access it.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
