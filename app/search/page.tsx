"use client";

import YouTubeHeader from "@/components/layout/Header";
import YouTubeSidebar from "@/components/layout/Sidebar";
import Image from "next/image";
import Link from "next/link";
import { formatViewCount, formatUploadDate } from "@/lib/utils/upload";

const searchResults = Array.from({ length: 15 }, (_, i) => ({
    id: `search-${i + 1}`,
    title: `Search Result Video #${i + 1} - Exactly What You're Looking For`,
    channelName: `Creator ${i + 1}`,
    thumbnail: "/placeholder-video.jpg",
    views: Math.floor(Math.random() * 2000000),
    uploadDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
    duration: "15:42",
    description: "This is a video description that provides context about the content and helps users decide if they want to watch...",
}));

export default function SearchPage() {
    return (
        <div className="min-h-screen">
            <YouTubeHeader />
            <YouTubeSidebar />

            <main className="pt-14 ml-0 lg:ml-60">
                <div className="max-w-5xl p-6 space-y-4">
                    {searchResults.map((video) => (
                        <div key={video.id} className="flex gap-4 group">
                            {/* Thumbnail */}
                            <Link href={`/watch/${video.id}`} className="flex-shrink-0">
                                <div className="relative w-96 aspect-video bg-muted rounded-lg overflow-hidden">
                                    <Image
                                        src={video.thumbnail}
                                        alt={video.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                                        {video.duration}
                                    </div>
                                </div>
                            </Link>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <Link href={`/watch/${video.id}`}>
                                    <h3 className="text-lg font-medium line-clamp-2 mb-1 group-hover:text-blue-400">
                                        {video.title}
                                    </h3>
                                </Link>

                                <p className="yt-video-meta mb-3">
                                    {formatViewCount(video.views)} views • {formatUploadDate(video.uploadDate)}
                                </p>

                                <div className="flex items-center gap-2 mb-2">
                                    <div className="yt-avatar w-6 h-6">
                                        <span className="text-xs">C</span>
                                    </div>
                                    <Link href={`/channel/${video.channelName}`}>
                                        <span className="yt-channel-name">
                                            {video.channelName}
                                        </span>
                                    </Link>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-1">
                                    {video.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
