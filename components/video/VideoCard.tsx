"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDuration, formatViewCount, formatUploadDate } from "@/lib/utils/upload";

interface VideoCardProps {
    id: string;
    title: string;
    channelName: string;
    channelAvatar?: string;
    thumbnail: string;
    views: number;
    uploadDate: Date;
    duration: number;
}

export default function VideoCard({
    id,
    title,
    channelName,
    channelAvatar,
    thumbnail,
    views,
    uploadDate,
    duration,
}: VideoCardProps) {
    return (
        <div className="yt-video-card">
            <Link href={`/watch/${id}`}>
                <div className="yt-video-thumbnail group">
                    <Image
                        src={thumbnail || "/placeholder-video.jpg"}
                        alt={title}
                        width={320}
                        height={180}
                        className="w-full h-full object-cover"
                    />
                    <div className="yt-duration-badge">
                        {formatDuration(duration)}
                    </div>
                </div>
            </Link>

            <div className="flex gap-3 mt-3">
                {/* Channel Avatar */}
                <Link href={`/channel/${channelName}`}>
                    <div className="yt-avatar w-9 h-9 flex-shrink-0">
                        {channelAvatar ? (
                            <Image
                                src={channelAvatar}
                                alt={channelName}
                                width={36}
                                height={36}
                                className="rounded-full"
                            />
                        ) : (
                            <span className="text-sm font-medium">
                                {channelName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                </Link>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                    <Link href={`/watch/${id}`}>
                        <h3 className="yt-video-title mb-1">{title}</h3>
                    </Link>

                    <Link href={`/channel/${channelName}`}>
                        <p className="yt-channel-name">{channelName}</p>
                    </Link>

                    <p className="yt-video-meta">
                        {formatViewCount(views)} views • {formatUploadDate(uploadDate)}
                    </p>
                </div>
            </div>
        </div>
    );
}
