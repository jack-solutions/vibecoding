import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoPlayer from '@/components/VideoPlayer';
import VideoCard from '@/components/VideoCard';
import CommentSection from '@/components/CommentSection';
import SubscribeButton from '@/components/SubscribeButton';
import { getVideoById, getVideos, incrementViews, formatViews, formatTimeAgo, formatSubscribers, getChannelById, toggleLike, initializeStorage, type Video } from '@/lib/storage';
import { toast } from 'sonner';

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    initializeStorage();
    const fetchedVideo = getVideoById(id);
    if (fetchedVideo) {
      setVideo(fetchedVideo);
      incrementViews(id);

      // Get related videos (same channel or random)
      const allVideos = getVideos();
      const related = allVideos
        .filter((v) => v.id !== id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
      setRelatedVideos(related);
    }
  }, [id]);

  const handleLike = () => {
    if (!video) return;

    if (isLiked) {
      toggleLike(video.id, false);
      setIsLiked(false);
    } else {
      if (isDisliked) setIsDisliked(false);
      toggleLike(video.id, true);
      setIsLiked(true);
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      if (isLiked) {
        toggleLike(video!.id, false);
        setIsLiked(false);
      }
      setIsDisliked(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const channel = getChannelById(video.channelId);

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 max-w-[1200px]">
          {/* Video player */}
          <VideoPlayer
            videoUrl={video.videoUrl}
            thumbnail={video.thumbnail}
            title={video.title}
          />

          {/* Video info */}
          <div className="mt-4">
            <h1 className="text-xl lg:text-2xl font-bold mb-2">{video.title}</h1>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
              {/* Channel info */}
              <div className="flex items-center gap-4">
                <Link to={`/channel/${video.channelId}`}>
                  <img
                    src={video.channelAvatar}
                    alt={video.channelName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent hover:ring-primary/50 transition-all"
                  />
                </Link>
                <div>
                  <Link
                    to={`/channel/${video.channelId}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {video.channelName}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {channel ? formatSubscribers(channel.subscribers) : ''}
                  </p>
                </div>
                <SubscribeButton channelId={video.channelId} channelName={video.channelName} />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-secondary rounded-full overflow-hidden">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 hover:bg-accent transition-colors ${
                      isLiked ? 'text-primary' : ''
                    }`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{(video.likes + (isLiked ? 1 : 0)).toLocaleString()}</span>
                  </button>
                  <div className="w-px h-6 bg-border" />
                  <button
                    onClick={handleDislike}
                    className={`px-4 py-2 hover:bg-accent transition-colors ${
                      isDisliked ? 'text-primary' : ''
                    }`}
                  >
                    <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <Button
                  variant="secondary"
                  className="rounded-full"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>

                <Button variant="secondary" className="rounded-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>

                <Button variant="secondary" size="icon" className="rounded-full">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 p-4 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <span>{formatViews(video.views)}</span>
                <span>•</span>
                <span>{formatTimeAgo(video.createdAt)}</span>
              </div>
              <p className={`text-sm whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                {video.description}
              </p>
              {video.description.length > 150 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-sm font-medium text-primary mt-2 hover:underline"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>

            {/* Comments */}
            <CommentSection videoId={video.id} />
          </div>
        </div>

        {/* Related videos sidebar */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <h3 className="font-semibold mb-4">Related Videos</h3>
          <div className="space-y-3">
            {relatedVideos.map((relatedVideo, index) => (
              <div
                key={relatedVideo.id}
                className="opacity-0 animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <VideoCard video={relatedVideo} variant="horizontal" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
