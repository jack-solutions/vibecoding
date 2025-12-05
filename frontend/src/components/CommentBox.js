import React, { useState } from 'react';
import { commentAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import './CommentBox.css';

const CommentBox = ({ videoId, onCommentAdded }) => {
  const { isAuthenticated, user } = useAuth();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    try {
      const response = await commentAPI.addComment({
        videoId,
        text: comment,
      });
      onCommentAdded(response.data);
      setComment('');
      setFocused(false);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setComment('');
    setFocused(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="yt-comment-signin">
        <p>Sign in to comment</p>
      </div>
    );
  }

  return (
    <div className="yt-comment-box">
      <div className="yt-comment-box-avatar">
        {user.username.charAt(0).toUpperCase()}
      </div>
      
      <div className="yt-comment-box-form">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onFocus={() => setFocused(true)}
            className="yt-comment-input"
          />
          
          {focused && (
            <div className="yt-comment-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="yt-comment-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="yt-comment-submit"
                disabled={loading || !comment.trim()}
              >
                {loading ? 'Posting...' : 'Comment'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CommentBox;
