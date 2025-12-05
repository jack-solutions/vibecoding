import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import SubscribeButton from '@/components/SubscribeButton';
import { getChannelById, getVideosByChannel, formatSubscribers, initializeStorage, type Channel as ChannelType, type Video } from '@/lib/storage';
import { cn } from '@/lib/utils';

const tabs = ['Videos', 'About'];

const Channel = () => {
  const { id } = useParams<{ id: string }>();
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState('Videos');

  useEffect(() => {
    if (!id) return;

    initializeStorage();
    const fetchedChannel = getChannelById(id);
    if (fetchedChannel) {
      setChannel(fetchedChannel);
      setVideos(getVideosByChannel(id));
    }
  }, [id]);

  if (!channel) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-32 sm:h-48 lg:h-64 overflow-hidden">
        <img
          src={channel.banner}
          alt={`${channel.name} banner`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Channel info */}
      <div className="relative px-4 lg:px-6 pb-6 -mt-16 sm:-mt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <img
            src={channel.avatar}
            alt={channel.name}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-background ring-4 ring-primary/20"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{channel.name}</h1>
              <CheckCircle2 className="w-5 h-5 text-muted-foreground fill-current" />
            </div>
            <p className="text-muted-foreground text-sm mb-3">
              {formatSubscribers(channel.subscribers)} • {videos.length} videos
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl mb-4">
              {channel.description}
            </p>
            <SubscribeButton
              channelId={channel.id}
              channelName={channel.name}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border sticky top-14 bg-background/95 backdrop-blur-md z-10">
        <div className="px-4 lg:px-6 flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-4 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        {activeTab === 'Videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="opacity-0 animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <VideoCard video={video} />
              </div>
            ))}
            {videos.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground text-lg mb-2">No videos yet</p>
                <p className="text-sm text-muted-foreground">
                  This channel hasn't uploaded any videos
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'About' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">About {channel.name}</h2>
            <p className="text-foreground/90 mb-6 whitespace-pre-wrap">
              {channel.description}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Subscribers:</span>
                <span className="font-medium">{formatSubscribers(channel.subscribers)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Videos:</span>
                <span className="font-medium">{videos.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Joined:</span>
                <span className="font-medium">
                  {new Date(channel.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Channel;
