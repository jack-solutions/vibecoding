import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Clock, ThumbsUp, PlaySquare, Flame, Music, Gamepad2, Newspaper, Trophy, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSubscribedChannels, type Channel } from '@/lib/storage';
import { useEffect, useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
}

const mainMenuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/?filter=explore' },
  { icon: Flame, label: 'Trending', path: '/?filter=trending' },
];

const libraryItems = [
  { icon: Clock, label: 'History', path: '/?filter=history' },
  { icon: PlaySquare, label: 'Your videos', path: '/?filter=yours' },
  { icon: ThumbsUp, label: 'Liked videos', path: '/?filter=liked' },
];

const exploreItems = [
  { icon: Music, label: 'Music', path: '/?category=music' },
  { icon: Gamepad2, label: 'Gaming', path: '/?category=gaming' },
  { icon: Newspaper, label: 'News', path: '/?category=news' },
  { icon: Trophy, label: 'Sports', path: '/?category=sports' },
  { icon: Film, label: 'Movies', path: '/?category=movies' },
];

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const [subscribedChannels, setSubscribedChannels] = useState<Channel[]>([]);

  useEffect(() => {
    setSubscribedChannels(getSubscribedChannels());
  }, [location]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' && !location.search;
    }
    return location.pathname + location.search === path;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-background border-r border-border z-40 transition-all duration-300 overflow-y-auto",
        isOpen ? "w-60" : "w-[72px]"
      )}
    >
      <nav className="p-2">
        {/* Main Menu */}
        <div className="mb-4">
          {mainMenuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <div
                className={cn(
                  "sidebar-item",
                  isActive(item.path) && "active",
                  !isOpen && "justify-center px-0"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="truncate">{item.label}</span>}
              </div>
            </Link>
          ))}
        </div>

        {isOpen && (
          <>
            {/* Divider */}
            <div className="h-px bg-border my-3" />

            {/* Library */}
            <div className="mb-4">
              <h3 className="px-3 py-2 text-sm font-semibold text-muted-foreground">Library</h3>
              {libraryItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <div className={cn("sidebar-item", isActive(item.path) && "active")}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-border my-3" />

            {/* Subscriptions */}
            {subscribedChannels.length > 0 && (
              <div className="mb-4">
                <h3 className="px-3 py-2 text-sm font-semibold text-muted-foreground">Subscriptions</h3>
                {subscribedChannels.map((channel) => (
                  <Link key={channel.id} to={`/channel/${channel.id}`}>
                    <div className="sidebar-item">
                      <img
                        src={channel.avatar}
                        alt={channel.name}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="truncate">{channel.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-border my-3" />

            {/* Explore */}
            <div className="mb-4">
              <h3 className="px-3 py-2 text-sm font-semibold text-muted-foreground">Explore</h3>
              {exploreItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <div className={cn("sidebar-item", isActive(item.path) && "active")}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="px-3 py-4 text-xs text-muted-foreground">
              <p className="mb-2">© 2024 VideoHub</p>
              <p>Built with React & Tailwind</p>
            </div>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
