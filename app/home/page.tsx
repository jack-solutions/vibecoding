"use client";

import { useState, useEffect } from "react";
import YouTubeHeader from "@/components/layout/Header";
import YouTubeSidebar from "@/components/layout/Sidebar";
import FilterChips from "@/components/layout/FilterChips";
import VideoCard from "@/components/video/VideoCard";

export default function HomePage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchVideos();
    }, [selectedFilter]);

    const fetchVideos = async () => {
        setLoading(true);
        setError("");

        try {
            // Fetch recommended/trending videos based on filter
            const endpoint = selectedFilter === "All"
                ? "/api/videos/recommended?limit=50"
                : `/api/videos/search?q=${encodeURIComponent(selectedFilter)}&limit=50`;

            const res = await fetch(endpoint);
            const data = await res.json();

            if (data.success) {
                setVideos(data.data.videos || []);
            } else {
                setError(data.message || "Failed to load videos");
            }
        } catch (err) {
            console.error("Error fetching videos:", err);
            setError("Failed to load videos. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <YouTubeHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className="hidden lg:block">
                <YouTubeSidebar collapsed={sidebarCollapsed} />
            </div>

            {/* Main Content */}
            <main className={`pt-14 transition-all duration-200 ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-60"
                }`}>
                {/* Filter Chips */}
                <FilterChips selected={selectedFilter} onSelect={setSelectedFilter} />

                {/* Video Grid */}
                <div className="p-4 md:p-6">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10">
                            {Array.from({ length: 20 }).map((_, i) => (
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
                                onClick={fetchVideos}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-lg text-muted-foreground">No videos found</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Try selecting a different filter
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10">
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
