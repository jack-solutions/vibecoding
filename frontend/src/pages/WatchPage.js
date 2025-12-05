import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { videoAPI, commentAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import CommentBox from '../components/CommentBox';
import CommentList from '../components/CommentList';
import SubscribeButton from '../components/SubscribeButton';
import VideoCard from '../components/VideoCard';
import './WatchPage.css';

const WatchPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    fetchVideo();
    fetchComments();
    fetchRelatedVideos();
  }, [id]);

  const fetchVideo = async () => {
    try {
      const response = await videoAPI.getVideo(id);
      setVideo(response.data);
      
      if (user) {
        setLiked(response.data.likes.includes(user._id));
        setDisliked(response.data.dislikes.includes(user._id));
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getVideoComments(id);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const response = await videoAPI.getRecommended();
      setRelatedVideos(response.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching related videos:', error);
    }
  };

  const handleLike = async () => {
    try {
      await videoAPI.likeVideo(id);
      fetchVideo();
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleDislike = async () => {
    try {
      await videoAPI.dislikeVideo(id);
      fetchVideo();
    } catch (error) {
      console.error('Error disliking video:', error);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments([newComment, ...comments]);
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter(c => c._id !== commentId));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!video) {
    return <div className="error-message">Video not found</div>;
  }

  return (
    <div className="yt-watch-page">
      <div className="yt-watch-primary">
        <VideoPlayer url={video.videoUrl} />
        
        <div className="yt-watch-metadata">
          <h1 className="yt-watch-title">{video.title}</h1>
          
          <div className="yt-watch-info-row">
            <div className="yt-watch-channel-info">
              <Link to={`/channel/${video.channel._id}`} className="yt-watch-channel-avatar">
                {video.channel.name.charAt(0).toUpperCase()}
              </Link>
              <div className="yt-watch-channel-details">
                <Link to={`/channel/${video.channel._id}`} className="yt-watch-channel-name">
                  {video.channel.name}
                </Link>
                <div className="yt-watch-subscriber-count">
                  {video.channel.subscribers?.length || 0} subscribers
                </div>
              </div>
              <SubscribeButton 
                channelId={video.channel._id}
                initialSubscriberCount={video.channel.subscribers?.length || 0}
                initialIsSubscribed={video.channel.subscribers?.includes(user?._id)}
              />
            </div>
            
            <div className="yt-watch-actions">
              <div className="yt-action-buttons">
                <button 
                  className={`yt-action-btn ${liked ? 'active' : ''}`}
                  onClick={handleLike}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                  </svg>
                  <span>{video.likes.length}</span>
                </button>
                <div className="yt-action-divider"></div>
                <button 
                  className={`yt-action-btn ${disliked ? 'active' : ''}`}
                  onClick={handleDislike}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                  </svg>
                </button>
              </div>
              
              <button className="yt-action-btn">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M15 5.63 20.66 12 15 18.37V14h-1c-3.96 0-7.14 1-9.75 3.09 1.84-4.07 5.11-6.4 9.89-7.1l.86-.13V5.63M14 3v6C6.22 10.13 3.11 15.33 2 21c2.78-3.97 6.44-6 12-6v6l8-9-8-9z"/>
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        <div className="yt-watch-description">
          <div className="yt-description-header">
            <span className="yt-description-views">{video.views} views</span>
            <span className="yt-separator">•</span>
            <span className="yt-description-date">{formatDate(video.createdAt)}</span>
          </div>
          
          <div className={`yt-description-text ${showFullDescription ? 'expanded' : ''}`}>
            {video.description || 'No description'}
          </div>
          
          {video.description && video.description.length > 100 && (
            <button 
              className="yt-description-toggle"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        <div className="yt-watch-comments">
          <CommentBox videoId={id} onCommentAdded={handleCommentAdded} />
          <CommentList comments={comments} onCommentDeleted={handleCommentDeleted} />
        </div>
      </div>

      <div className="yt-watch-secondary">
        <div className="yt-related-videos">
          {relatedVideos.map((relatedVideo) => (
            <div key={relatedVideo._id} className="yt-related-video-item">
              <Link to={`/watch/${relatedVideo._id}`} className="yt-related-thumbnail">
                {relatedVideo.thumbnailUrl ? (
                  <img 
                    src={`http://localhost:5000${relatedVideo.thumbnailUrl}`} 
                    alt={relatedVideo.title}
                  />
                ) : (
                  <div className="yt-related-thumbnail-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </Link>
              
              <div className="yt-related-details">
                <Link to={`/watch/${relatedVideo._id}`} className="yt-related-title">
                  {relatedVideo.title}
                </Link>
                <Link to={`/channel/${relatedVideo.channel?._id}`} className="yt-related-channel">
                  {relatedVideo.channel?.name || relatedVideo.creator?.username}
                </Link>
                <div className="yt-related-info">
                  {relatedVideo.views} views
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
