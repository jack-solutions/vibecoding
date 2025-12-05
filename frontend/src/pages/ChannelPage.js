import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { channelAPI } from '../api/endpoints';
import VideoCard from '../components/VideoCard';
import SubscribeButton from '../components/SubscribeButton';
import { useAuth } from '../context/AuthContext';
import './ChannelPage.css';

const ChannelPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannel();
    fetchVideos();
  }, [id]);

  const fetchChannel = async () => {
    try {
      const response = await channelAPI.getChannel(id);
      setChannel(response.data);
    } catch (error) {
      console.error('Error fetching channel:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await channelAPI.getChannelVideos(id);
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!channel) {
    return <div className="error-message">Channel not found</div>;
  }

  return (
    <div className="channel-page">
      <div className="channel-header">
        <div className="channel-avatar-large">
          {channel.name.charAt(0).toUpperCase()}
        </div>
        <div className="channel-info-header">
          <h1>{channel.name}</h1>
          <p className="channel-stats">
            {channel.subscribers?.length || 0} subscribers • {videos.length} videos
          </p>
          {channel.description && (
            <p className="channel-description">{channel.description}</p>
          )}
        </div>
        <SubscribeButton 
          channelId={channel._id}
          initialSubscriberCount={channel.subscribers?.length || 0}
          initialIsSubscribed={channel.subscribers?.includes(user?._id)}
        />
      </div>

      <div className="channel-videos">
        <h2>Videos</h2>
        {videos.length === 0 ? (
          <p className="no-videos">No videos yet</p>
        ) : (
          <div className="video-grid">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelPage;
