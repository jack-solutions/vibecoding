import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../api/endpoints';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchVideos = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await videoAPI.search(query);
        setSuggestions(response.data.slice(0, 8)); // Show max 8 suggestions
      } catch (error) {
        console.error('Error searching:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchVideos();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (videoId) => {
    navigate(`/watch/${videoId}`);
    setShowSuggestions(false);
    setQuery('');
  };

  return (
    <form className="yt-search-container" onSubmit={handleSubmit}>
      <div className="yt-search-wrapper">
        <div className="yt-search-box">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="yt-search-input"
          />
          <button type="submit" className="yt-search-button">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M20.87 20.17l-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
            </svg>
          </button>
        </div>

        {showSuggestions && query.trim().length >= 2 && (
          <div className="yt-search-suggestions">
            {loading ? (
              <div className="yt-search-loading">
                <div className="spinner-small"></div>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((video) => (
                <div
                  key={video._id}
                  className="yt-search-suggestion-item"
                  onClick={() => handleSuggestionClick(video._id)}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M20.87 20.17l-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                  </svg>
                  <span>{video.title}</span>
                </div>
              ))
            ) : (
              <div className="yt-search-no-results">
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      <button type="button" className="btn-icon yt-voice-search" title="Search with your voice">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;
