import React, { useState, useEffect } from 'react';
import { videoAPI } from '../api/endpoints';
import VideoCard from '../components/VideoCard';
import './HomePage.css';

const HomePage = () => {
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState('all');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const [trendingRes, recommendedRes] = await Promise.all([
        videoAPI.getTrending(),
        videoAPI.getRecommended(),
      ]);
      
      setTrendingVideos(trendingRes.data);
      setRecommendedVideos(recommendedRes.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const chips = ['All', 'Music', 'Gaming', 'Live', 'News', 'Sports', 'Learning', 'Fashion'];

  return (
    <div className="yt-home-page">
      <div className="yt-chips-bar">
        {chips.map((chip) => (
          <button
            key={chip}
            className={`yt-chip ${activeChip === chip.toLowerCase() ? 'active' : 'text-gray-500'}`}
            onClick={() => setActiveChip(chip.toLowerCase())}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="yt-video-grid">
        {[...trendingVideos, ...recommendedVideos].map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
