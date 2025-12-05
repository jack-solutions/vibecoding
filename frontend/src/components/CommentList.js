import React from 'react';
import { commentAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import './CommentList.css';

const CommentList = ({ comments, onCommentDeleted }) => {
  const { user } = useAuth();

  const handleDelete = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await commentAPI.deleteComment(commentId);
        onCommentDeleted(commentId);
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment');
      }
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffTime = Math.abs(now - commentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="yt-no-comments">
        <p>No comments yet</p>
      </div>
    );
  }

  return (
    <div className="yt-comment-list">
      <div className="yt-comment-count">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </div>
      
      {comments.map((comment) => (
        <div key={comment._id} className="yt-comment-item">
          <div className="yt-comment-avatar">
            {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className="yt-comment-content">
            <div className="yt-comment-header">
              <span className="yt-comment-author">
                @{comment.user?.username || 'Unknown'}
              </span>
              <span className="yt-comment-date">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            
            <div className="yt-comment-text">
              {comment.text}
            </div>
            
            <div className="yt-comment-toolbar">
              <button className="yt-comment-like-btn">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                </svg>
              </button>
              
              <button className="yt-comment-dislike-btn">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                </svg>
              </button>
              
              <button className="yt-comment-reply-btn">
                Reply
              </button>
              
              {(user?._id === comment.user?._id || user?.role === 'Admin') && (
                <button 
                  className="yt-comment-delete-btn"
                  onClick={() => handleDelete(comment._id)}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
