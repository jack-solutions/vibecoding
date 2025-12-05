import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { videoAPI } from '../api/endpoints';
import VideoCard from '../components/VideoCard';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchVideos();
    }
  }, [query]);

  const searchVideos = async () => {
    setLoading(true);
    try {
      const response = await videoAPI.searchVideos(query);
      setVideos(response.data);
    } catch (error) {
      console.error('Error searching videos:', error);
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

  return (
    <div className="search-page">
      <h1>Search results for "{query}"</h1>
      
      {videos.length === 0 ? (
        <div className="no-results">
          <p>No videos found</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
