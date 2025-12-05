"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import YouTubeHeader from "@/components/layout/Header";
import VideoCard from "@/components/video/VideoCard";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default function ChannelPage() {
    const params = useParams();
    const [channel, setChannel] = useState<any>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        fetchChannelData();
    }, [params.id]);

    const fetchChannelData = async () => {
        try {
            const res = await fetch(`/api/channels/${params.id}`);
            const data = await res.json();

            if (data.success) {
                setChannel(data.data.channel);
                setVideos(data.data.videos);
            }
        } catch (err) {
            console.error("Error fetching channel:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        setSubscribing(true);
        try {
            const res = await fetch(`/api/channels/${params.id}/subscribe`, {
                method: "POST",
            });

            const data = await res.json();

            if (data.success) {
                setChannel({
                    ...channel,
                    isSubscribed: !channel.isSubscribed,
                    subscriberCount: data.data.subscriberCount,
                });
            }
        } catch (err) {
            console.error("Subscribe error:", err);
        } finally {
            setSubscribing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <YouTubeHeader />
                <div className="pt-14 flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!channel) {
        return (
            <div className="min-h-screen">
                <YouTubeHeader />
                <div className="pt-14 flex items-center justify-center h-96">
                    <p className="text-xl">Channel not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <YouTubeHeader />

            <main className="pt-14">
                {/* Channel Banner */}
                {channel.banner && (
                    <div className="w-full h-48 md:h-64 relative bg-muted">
                        <Image
                            src={channel.banner}
                            alt={channel.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Channel Info */}
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="py-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <div className="yt-avatar w-20 h-20 md:w-32 md:h-32 text-2xl md:text-4xl font-bold flex-shrink-0">
                            {channel.avatar ? (
                                <Image src={channel.avatar} alt={channel.name} fill className="rounded-full" />
                            ) : (
                                channel.name?.charAt(0).toUpperCase()
                            )}
                        </div>

                        {/* Channel Details */}
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-4xl font-bold mb-1">{channel.name}</h1>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                                <span>@{channel.handle}</span>
                                <span>•</span>
                                <span>{channel.subscriberCount?.toLocaleString()} subscribers</span>
                                <span>•</span>
                                <span>{channel.videoCount} videos</span>
                            </div>
                            {channel.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {channel.description}
                                </p>
                            )}
                        </div>

                        {/* Subscribe Button */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className={`rounded-full px-6 ${channel.isSubscribed
                                        ? "bg-muted text-foreground hover:bg-accent"
                                        : "bg-foreground text-background hover:bg-foreground/90"
                                    }`}
                            >
                                {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                            </Button>
                            {channel.isSubscribed && (
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Bell className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Videos Section */}
                    <div className="border-t border-border pt-8 pb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-xl font-semibold">Videos</h2>
                        </div>

                        {videos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                                {videos.map((video) => (
                                    <VideoCard key={video._id} id={video._id} {...video} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">This channel has no videos yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
