import React, { useState } from 'react';
import { channelAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import './SubscribeButton.css';

const SubscribeButton = ({ channelId, initialSubscriberCount, initialIsSubscribed }) => {
  const { isAuthenticated } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [subscriberCount, setSubscriberCount] = useState(initialSubscriberCount);
  const [loading, setLoading] = useState(false);

  const handleToggleSubscribe = async () => {
    if (!isAuthenticated) {
      alert('Please log in to subscribe');
      return;
    }

    setLoading(true);
    try {
      const response = await channelAPI.toggleSubscribe(channelId);
      setIsSubscribed(response.data.isSubscribed);
      setSubscriberCount(response.data.subscriberCount);
    } catch (error) {
      console.error('Error toggling subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`yt-subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
      onClick={handleToggleSubscribe}
      disabled={loading}
    >
      {loading ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
    </button>
  );
};

export default SubscribeButton;
