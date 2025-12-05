import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isSubscribed, toggleSubscription } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SubscribeButtonProps {
  channelId: string;
  channelName: string;
  size?: 'default' | 'sm' | 'lg';
}

const SubscribeButton = ({ channelId, channelName, size = 'default' }: SubscribeButtonProps) => {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setSubscribed(isSubscribed(channelId));
  }, [channelId]);

  const handleClick = () => {
    const newState = toggleSubscription(channelId);
    setSubscribed(newState);
    
    if (newState) {
      toast.success(`Subscribed to ${channelName}`, {
        description: "You'll be notified of new uploads",
      });
    } else {
      toast.info(`Unsubscribed from ${channelName}`);
    }
  };

  return (
    <Button
      onClick={handleClick}
      size={size}
      className={cn(
        "rounded-full font-medium transition-all duration-200",
        subscribed
          ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95"
      )}
    >
      {subscribed ? (
        <>
          <BellOff className="w-4 h-4 mr-2" />
          Subscribed
        </>
      ) : (
        <>
          <Bell className="w-4 h-4 mr-2" />
          Subscribe
        </>
      )}
    </Button>
  );
};

export default SubscribeButton;
