import { Link } from 'react-router-dom';
import { formatSubscribers, type Channel } from '@/lib/storage';

interface ChannelCardProps {
  channel: Channel;
  variant?: 'default' | 'compact';
}

const ChannelCard = ({ channel, variant = 'default' }: ChannelCardProps) => {
  if (variant === 'compact') {
    return (
      <Link to={`/channel/${channel.id}`} className="group">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
          <img
            src={channel.avatar}
            alt={channel.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {channel.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatSubscribers(channel.subscribers)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/channel/${channel.id}`} className="group">
      <div className="bg-card rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <img
          src={channel.avatar}
          alt={channel.name}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-transparent group-hover:ring-primary/30 transition-all"
        />
        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
          {channel.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          {formatSubscribers(channel.subscribers)}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {channel.description}
        </p>
      </div>
    </Link>
  );
};

export default ChannelCard;
