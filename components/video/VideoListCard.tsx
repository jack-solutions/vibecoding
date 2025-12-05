"use client";

import Image from "next/image";
import Link from "next/link";
import { formatViewCount, formatUploadDate } from "@/lib/utils/upload";

interface VideoListCardProps {
    id: string;
    title: string;
    channelName: string;
    channelAvatar?: string;
    thumbnail: string;
    views: number;
    uploadDate: Date;
    duration: string;
}

export default function VideoListCard({
    id,
    title,
    channelName,
    channelAvatar,
    thumbnail,
    views,
    uploadDate,
    duration,
}: VideoListCardProps) {
    return (
        <div className="flex gap-2 group cursor-pointer">
            {/* Thumbnail */}
            <Link href={`/watch/${id}`} className="flex-shrink-0">
                <div className="relative w-40 aspect-video bg-[#303030] rounded-lg overflow-hidden">
                    <Image
                        src={thumbnail || "/placeholder-video.jpg"}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                        {duration}
                    </div>
                </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <Link href={`/watch/${id}`}>
                    <h4 className="text-sm font-medium line-clamp-2 text-white mb-1">
                        {title}
                    </h4>
                </Link>

                <Link href={`/channel/${channelName}`}>
                    <p className="text-xs text-[#aaa] hover:text-white mb-0.5">
                        {channelName}
                    </p>
                </Link>

                <p className="text-xs text-[#aaa]">
                    {formatViewCount(views)} views • {formatUploadDate(uploadDate)}
                </p>
            </div>
        </div>
    );
}
