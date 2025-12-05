import { Link } from 'react-router-dom';
import { formatViews, formatTimeAgo, type Video } from '@/lib/storage';

interface VideoCardProps {
  video: Video;
  variant?: 'default' | 'horizontal' | 'compact';
}

const VideoCard = ({ video, variant = 'default' }: VideoCardProps) => {
  if (variant === 'horizontal') {
    return (
      <Link to={`/watch/${video.id}`} className="group">
        <div className="flex gap-2 p-2 rounded-lg hover:bg-accent transition-colors">
          <div className="video-thumbnail w-40 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="video-duration">{video.duration}</span>
          </div>
          <div className="flex-1 min-w-0 py-1">
            <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
            <p className="text-xs text-muted-foreground">{video.channelName}</p>
            <p className="text-xs text-muted-foreground">
              {formatViews(video.views)} • {formatTimeAgo(video.createdAt)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/watch/${video.id}`} className="group">
        <div className="flex gap-3">
          <div className="video-thumbnail w-44 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="video-duration">{video.duration}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-1">{video.channelName}</p>
            <p className="text-xs text-muted-foreground">
              {formatViews(video.views)} • {formatTimeAgo(video.createdAt)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/watch/${video.id}`} className="group">
      <div className="video-card">
        <div className="video-thumbnail">
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
          />
          <span className="video-duration">{video.duration}</span>
        </div>
        <div className="p-3">
          <div className="flex gap-3">
            <Link
              to={`/channel/${video.channelId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0"
            >
              <img
                src={video.channelAvatar}
                alt={video.channelName}
                className="channel-avatar"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              <Link
                to={`/channel/${video.channelId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {video.channelName}
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatViews(video.views)} • {formatTimeAgo(video.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
