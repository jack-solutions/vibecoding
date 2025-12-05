"use client";

import { useState, useEffect } from "react";
import YouTubeHeader from "@/components/layout/Header";
import YouTubeSidebar from "@/components/layout/Sidebar";
import VideoCard from "@/components/video/VideoCard";

export default function TrendingPage() {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTrendingVideos();
    }, []);

    const fetchTrendingVideos = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/videos/trending");
            const data = await res.json();

            if (data.success) {
                setVideos(data.data.videos || []);
            } else {
                setError(data.message || "Failed to load trending videos");
            }
        } catch (err) {
            console.error("Error fetching trending videos:", err);
            setError("Failed to load trending videos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <YouTubeHeader />
            <YouTubeSidebar />

            <main className="pt-14 ml-0 lg:ml-60">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6">Trending</h1>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-video bg-muted rounded-xl mb-3" />
                                    <div className="flex gap-3">
                                        <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted rounded w-full" />
                                            <div className="h-3 bg-muted rounded w-2/3" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-lg text-muted-foreground mb-4">{error}</p>
                            <button
                                onClick={fetchTrendingVideos}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-lg text-muted-foreground">No trending videos available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                            {videos.map((video) => (
                                <VideoCard
                                    key={video._id}
                                    id={video._id}
                                    title={video.title}
                                    channelName={video.channelId?.name || video.creatorId?.name || "Unknown Channel"}
                                    thumbnail={video.thumbnailUrl}
                                    views={video.views}
                                    uploadDate={new Date(video.uploadDate || video.createdAt)}
                                    duration={video.duration}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
