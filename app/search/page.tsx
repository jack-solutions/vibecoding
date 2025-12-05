"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import YouTubeHeader from "@/components/layout/Header";
import YouTubeSidebar from "@/components/layout/Sidebar";
import Image from "next/image";
import Link from "next/link";
import { formatViewCount, formatUploadDate } from "@/lib/utils/upload";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (query) {
            searchVideos();
        }
    }, [query]);

    const searchVideos = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/videos/search?q=${encodeURIComponent(query)}&limit=30`);
            const data = await res.json();

            if (data.success) {
                setVideos(data.data.videos || []);
            } else {
                setError(data.message || "Search failed");
            }
        } catch (err) {
            console.error("Error searching videos:", err);
            setError("Failed to search videos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <YouTubeHeader />
            <YouTubeSidebar />

            <main className="pt-14 ml-0 lg:ml-60">
                <div className="max-w-5xl p-6">
                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="w-96 aspect-video bg-muted rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-muted rounded w-3/4" />
                                        <div className="h-4 bg-muted rounded w-1/2" />
                                        <div className="h-10 bg-muted rounded-full w-10" />
                                        <div className="h-4 bg-muted rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-lg text-muted-foreground mb-4">{error}</p>
                            <button
                                onClick={searchVideos}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-lg font-medium mb-2">No results found for "{query}"</p>
                            <p className="text-sm text-muted-foreground">
                                Try different keywords or remove search filters
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {videos.map((video) => (
                                <div key={video._id} className="flex gap-4 group">
                                    {/* Thumbnail */}
                                    <Link href={`/watch/${video._id}`} className="flex-shrink-0">
                                        <div className="relative w-96 aspect-video bg-muted rounded-lg overflow-hidden">
                                            {video.thumbnailUrl ? (
                                                <Image
                                                    src={video.thumbnailUrl}
                                                    alt={video.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                    <span className="text-4xl">🎥</span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                                                {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/watch/${video._id}`}>
                                            <h3 className="text-lg font-medium line-clamp-2 mb-1 group-hover:text-blue-400">
                                                {video.title}
                                            </h3>
                                        </Link>

                                        <p className="yt-video-meta mb-3">
                                            {formatViewCount(video.views)} views • {formatUploadDate(new Date(video.uploadDate || video.createdAt))}
                                        </p>

                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="yt-avatar w-6 h-6">
                                                <span className="text-xs">
                                                    {(video.channelId?.name || video.creatorId?.name || "U").charAt(0)}
                                                </span>
                                            </div>
                                            <Link href={`/channel/${video.channelId?._id || video.channelId}`}>
                                                <span className="yt-channel-name">
                                                    {video.channelId?.name || video.creatorId?.name || "Unknown Channel"}
                                                </span>
                                            </Link>
                                        </div>

                                        {video.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {video.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
