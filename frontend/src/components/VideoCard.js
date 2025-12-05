import React from 'react';
import { Link } from 'react-router-dom';
import './VideoCard.css';

const VideoCard = ({ video }) => {
  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  const formatDate = (date) => {
    const now = new Date();
    const videoDate = new Date(date);
    const diffTime = Math.abs(now - videoDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="yt-video-card">
      <Link to={`/watch/${video._id}`} className="yt-thumbnail-link">
        <div className="yt-thumbnail">
          {video.thumbnailUrl ? (
            <img 
              src={`http://localhost:5000${video.thumbnailUrl}`} 
              alt={video.title}
            />
          ) : (
            <div className="yt-thumbnail-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          )}
        </div>
      </Link>
      
      <div className="yt-video-details">
        <Link to={`/channel/${video.channel?._id}`} className="yt-channel-icon">
          {video.channel?.name?.charAt(0).toUpperCase() || video.creator?.username?.charAt(0).toUpperCase()}
        </Link>
        
        <div className="yt-video-meta">
          <Link to={`/watch/${video._id}`} className="yt-video-title">
            {video.title}
          </Link>
          
          <Link to={`/channel/${video.channel?._id}`} className="yt-channel-name">
            {video.channel?.name || video.creator?.username}
          </Link>
          
          <div className="yt-video-info">
            <span>{formatViews(video.views)} views</span>
            <span className="yt-separator">•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>
        
        <button className="yt-menu-button btn-icon">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VideoCard;
