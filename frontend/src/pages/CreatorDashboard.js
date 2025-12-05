import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, videoAPI } from '../api/endpoints';
import './CreatorDashboard.css';

const CreatorDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', tags: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, videosRes] = await Promise.all([
        analyticsAPI.getCreatorAnalytics(),
        videoAPI.getMyVideos()
      ]);
      setAnalytics(analyticsRes.data);
      setVideos(videosRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await videoAPI.deleteVideo(videoId);
        setVideos(videos.filter(v => v._id !== videoId));
        alert('Video deleted successfully');
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video');
      }
    }
  };

  const handleEditClick = (video) => {
    setEditingVideo(video._id);
    setEditForm({
      title: video.title,
      description: video.description || '',
      tags: video.tags ? video.tags.join(', ') : ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await videoAPI.updateVideo(editingVideo, editForm);
      setVideos(videos.map(v => v._id === editingVideo ? response.data : v));
      setEditingVideo(null);
      alert('Video updated successfully');
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Failed to update video');
    }
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

  return (
    <div className="yt-creator-dashboard">
      <div className="dashboard-header">
        <h1>Creator Dashboard</h1>
        <Link to="/upload" className="btn btn-primary">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm3-7H3v12h14v-6.39l4 1.83V8.56l-4 1.83V6m1-1v3.83L22 7v8l-4-1.83V19H2V5h16z"/>
          </svg>
          Upload Video
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm3-7H3v12h14v-6.39l4 1.83V8.56l-4 1.83V6m1-1v3.83L22 7v8l-4-1.83V19H2V5h16z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{analytics?.totalUploads || 0}</h3>
            <p>Total Videos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{analytics?.totalViews?.toLocaleString() || 0}</h3>
            <p>Total Views</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{analytics?.totalLikes?.toLocaleString() || 0}</h3>
            <p>Total Likes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{analytics?.subscriberCount?.toLocaleString() || 0}</h3>
            <p>Subscribers</p>
          </div>
        </div>
      </div>

      <div className="videos-section">
        <h2>Your Videos</h2>
        {videos.length === 0 ? (
          <div className="no-videos">
            <p>You haven't uploaded any videos yet.</p>
            <Link to="/upload" className="btn btn-primary">Upload Your First Video</Link>
          </div>
        ) : (
          <div className="videos-table-container">
            <table className="videos-table">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <React.Fragment key={video._id}>
                    <tr>
                      <td>
                        <div className="video-info">
                          {video.thumbnailUrl && (
                            <img 
                              src={`http://localhost:5000${video.thumbnailUrl}`} 
                              alt={video.title}
                              className="video-thumbnail"
                            />
                          )}
                          <div className="video-details">
                            <Link to={`/watch/${video._id}`} className="video-title">
                              {video.title}
                            </Link>
                            <p className="video-description">
                              {video.description?.substring(0, 60)}
                              {video.description?.length > 60 && '...'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>{video.views.toLocaleString()}</td>
                      <td>{video.likes.length}</td>
                      <td>0</td>
                      <td>{formatDate(video.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleEditClick(video)}
                            className="btn-icon"
                            title="Edit"
                          >
                            <svg viewBox="0 0 24 24" width="20" height="20">
                              <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(video._id)}
                            className="btn-icon btn-delete"
                            title="Delete"
                          >
                            <svg viewBox="0 0 24 24" width="20" height="20">
                              <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingVideo === video._id && (
                      <tr className="edit-row">
                        <td colSpan="6">
                          <form onSubmit={handleEditSubmit} className="edit-form">
                            <div className="form-row">
                              <div className="input-group">
                                <label>Title</label>
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                  required
                                  maxLength="100"
                                />
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="input-group">
                                <label>Description</label>
                                <textarea
                                  value={editForm.description}
                                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                  rows="3"
                                  maxLength="5000"
                                />
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="input-group">
                                <label>Tags (comma separated)</label>
                                <input
                                  type="text"
                                  value={editForm.tags}
                                  onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                                  placeholder="gaming, tutorial, funny"
                                />
                              </div>
                            </div>
                            <div className="form-actions">
                              <button type="button" onClick={() => setEditingVideo(null)} className="btn btn-secondary">
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-primary">
                                Save Changes
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
