import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flame, Clock, TrendingUp } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import ChannelCard from '@/components/ChannelCard';
import { getVideos, searchVideos, getSubscribedChannels, initializeStorage, type Video, type Channel } from '@/lib/storage';
import { cn } from '@/lib/utils';

const filterTabs = [
  { id: 'all', label: 'All', icon: null },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'popular', label: 'Popular', icon: TrendingUp },
];

const Home = () => {
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [subscribedChannels, setSubscribedChannels] = useState<Channel[]>([]);

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    // Ensure storage is initialized before fetching
    initializeStorage();
    
    if (searchQuery) {
      setVideos(searchVideos(searchQuery));
    } else {
      setVideos(getVideos());
    }
    setSubscribedChannels(getSubscribedChannels());
  }, [searchQuery]);

  const filteredVideos = useMemo(() => {
    let result = [...videos];

    switch (activeFilter) {
      case 'trending':
        result = result.sort((a, b) => b.views - a.views).slice(0, 10);
        break;
      case 'latest':
        result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        result = result.sort((a, b) => b.likes - a.likes);
        break;
      default:
        break;
    }

    return result;
  }, [videos, activeFilter]);

  return (
    <div className="p-4 lg:p-6">
      {/* Search results header */}
      {searchQuery && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            Search results for "{searchQuery}"
          </h1>
          <p className="text-muted-foreground">
            Found {filteredVideos.length} videos
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
              activeFilter === tab.id
                ? "bg-foreground text-background"
                : "bg-secondary text-foreground hover:bg-accent"
            )}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subscribed channels section */}
      {!searchQuery && subscribedChannels.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">•</span>
            Your Subscriptions
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {subscribedChannels.map((channel) => (
              <div key={channel.id} className="flex-shrink-0 w-32">
                <ChannelCard channel={channel} variant="compact" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending section */}
      {!searchQuery && activeFilter === 'all' && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            Trending Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos
              .sort((a, b) => b.views - a.views)
              .slice(0, 4)
              .map((video, index) => (
                <div
                  key={video.id}
                  className="opacity-0 animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <VideoCard video={video} />
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Main video grid */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          {searchQuery ? 'Results' : activeFilter === 'all' ? 'Recommended' : filterTabs.find(t => t.id === activeFilter)?.label}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVideos.map((video, index) => (
            <div
              key={video.id}
              className="opacity-0 animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <VideoCard video={video} />
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-2">No videos found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try different keywords' : 'Upload your first video!'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
