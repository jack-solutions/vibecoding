"use client";

import YouTubeHeader from "@/components/layout/Header";
import YouTubeSidebar from "@/components/layout/Sidebar";
import VideoCard from "@/components/video/VideoCard";

const trendingVideos = Array.from({ length: 24 }, (_, i) => ({
    id: `trending-${i + 1}`,
    title: `Trending Video #${i + 1}: Amazing Content You Must Watch!`,
    channelName: `Popular Channel ${i + 1}`,
    thumbnail: "/placeholder-video.jpg",
    views: Math.floor(Math.random() * 5000000) + 1000000,
    uploadDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    duration: Math.floor(Math.random() * 900) + 120,
}));

export default function TrendingPage() {
    return (
        <div className="min-h-screen">
            <YouTubeHeader />
            <YouTubeSidebar />

            <main className="pt-14 ml-0 lg:ml-60">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6">Trending</h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                        {trendingVideos.map((video) => (
                            <VideoCard key={video.id} {...video} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
