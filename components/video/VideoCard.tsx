import Link from "next/link";
import Image from "next/image";
import { formatViewCount, formatUploadDate, formatDuration } from "@/lib/utils/upload";

interface VideoCardProps {
    id: string;
    title: string;
    channelName: string;
    thumbnail: string;
    views: number;
    uploadDate: Date;
    duration: number;
    channelId?: string;
}

export default function VideoCard({
    id,
    title,
    channelName,
    thumbnail,
    views,
    uploadDate,
    duration,
    channelId,
}: VideoCardProps) {
    return (
        <div className="yt-video-card">
            <Link href={`/watch/${id}`}>
                {/* Thumbnail */}
                <div className="yt-video-thumbnail">
                    {thumbnail ? (
                        <Image
                            src={thumbnail}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                            <span className="text-4xl">🎥</span>
                        </div>
                    )}
                    <div className="yt-duration-badge">
                        {formatDuration(duration)}
                    </div>
                </div>

                {/* Video Info */}
                <div className="flex gap-3 mt-3">
                    {/* Channel Avatar */}
                    <Link
                        href={channelId ? `/channel/${channelId}` : "#"}
                        className="yt-avatar w-9 h-9 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="text-sm font-medium">
                            {channelName.charAt(0).toUpperCase()}
                        </span>
                    </Link>

                    {/* Title & Metadata */}
                    <div className="flex-1 min-w-0">
                        <h3 className="yt-video-title mb-1">{title}</h3>
                        <Link
                            href={channelId ? `/channel/${channelId}` : "#"}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <p className="yt-channel-name">{channelName}</p>
                        </Link>
                        <p className="yt-video-meta">
                            {formatViewCount(views)} views • {formatUploadDate(uploadDate)}
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    );
}
