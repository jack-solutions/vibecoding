"use client";

import YouTubeHeader from "@/components/layout/Header";
import VideoActions from "@/components/video/VideoActions";
import VideoListCard from "@/components/video/VideoListCard";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const mockVideo = {
    id: "1",
    title: "Amazing Video Title Goes Here - Full Tutorial",
    channelName: "Channel Name",
    views: 1234567,
    likes: 50000,
    dislikes: 500,
    uploadDate: new Date(),
    description: "This is a comprehensive video description that can be quite long. It includes information about the video content, links to resources, timestamps, and other relevant information that viewers might find useful...",
};

const recommendedVideos = Array.from({ length: 20 }, (_, i) => ({
    id: `rec-${i + 1}`,
    title: `Recommended Video Title ${i + 1} That Could Be Long`,
    channelName: `Channel ${i + 1}`,
    thumbnail: "/placeholder-video.jpg",
    views: Math.floor(Math.random() * 1000000),
    uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    duration: "12:34",
}));

export default function WatchPage() {
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    return (
        <div className="min-h-screen">
            <YouTubeHeader />

            <div className="pt-14">
                <div className="max-w-[1754px] mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-6">
                    {/* Primary Column */}
                    <div className="flex-1 min-w-0">
                        {/* Video Player */}
                        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-3">
                            <video className="w-full h-full" controls poster="/placeholder-video.jpg">
                                <source src="/sample-video.mp4" type="video/mp4" />
                            </video>
                        </div>

                        {/* Video Title */}
                        <h1 className="yt-video-title text-xl mb-3">{mockVideo.title}</h1>

                        {/* Channel Info + Actions */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            {/* Channel Info */}
                            <div className="flex items-center gap-3">
                                <div className="yt-avatar w-10 h-10">
                                    <span className="text-sm font-medium">C</span>
                                </div>

                                <div>
                                    <p className="yt-video-title">{mockVideo.channelName}</p>
                                    <p className="yt-video-meta">1.2M subscribers</p>
                                </div>

                                <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full ml-4">
                                    Subscribe
                                </Button>
                            </div>

                            {/* Actions */}
                            <VideoActions likes={mockVideo.likes} dislikes={mockVideo.dislikes} />
                        </div>

                        {/* Description */}
                        <div
                            className="bg-muted rounded-xl p-3 hover:bg-accent transition-colors cursor-pointer"
                            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                        >
                            <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                <span>{mockVideo.views.toLocaleString()} views</span>
                                <span>•</span>
                                <span>2 days ago</span>
                            </div>

                            <p className={`text-sm ${descriptionExpanded ? "" : "line-clamp-2"}`}>
                                {mockVideo.description}
                            </p>

                            {!descriptionExpanded && (
                                <button className="mt-2 text-sm font-medium flex items-center gap-1">
                                    Show more
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Secondary Column - Recommended */}
                    <div className="w-full lg:w-[402px] flex-shrink-0">
                        <div className="space-y-2">
                            {recommendedVideos.map((video) => (
                                <VideoListCard key={video.id} {...video} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
