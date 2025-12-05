import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaThumbsUp, FaThumbsDown, FaShare } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Watch.css';

const Watch = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const videoRes = await axios.get(`http://localhost:5000/api/videos/${id}`);
                setVideo(videoRes.data);

                // Check subscription status if user is logged in
                if (currentUser && videoRes.data) {
                    try {
                        const subRes = await axios.get(`http://localhost:5000/api/subscriptions/check?subscriber_id=${currentUser.id}&channel_id=${videoRes.data.user_id}`);
                        setIsSubscribed(subRes.data.subscribed);
                    } catch (e) {
                        console.error("Failed to check subscription", e);
                    }
                }

                const commentsRes = await axios.get(`http://localhost:5000/api/comments/${id}`);
                setComments(commentsRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, [id, currentUser]);

    const handleSubscribe = async () => {
        if (!currentUser) {
            alert('Please login to subscribe');
            return;
        }
        if (currentUser.id === video.user_id) {
            alert('You cannot subscribe to your own channel');
            return;
        }

        try {
            if (isSubscribed) {
                await axios.delete('http://localhost:5000/api/subscriptions', {
                    data: { subscriber_id: currentUser.id, channel_id: video.user_id }
                });
                setIsSubscribed(false);
            } else {
                await axios.post('http://localhost:5000/api/subscriptions', {
                    subscriber_id: currentUser.id, channel_id: video.user_id
                });
                setIsSubscribed(true);
            }
        } catch (err) {
            console.error('Subscription action failed:', err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await axios.post('http://localhost:5000/api/comments', {
                text: newComment,
                video_id: id,
                user_id: 1 // Hardcoded user for demo
            });
            setNewComment('');
            // Refresh comments
            const commentsRes = await axios.get(`http://localhost:5000/api/comments/${id}`);
            setComments(commentsRes.data);
        } catch (err) {
            console.error('Error posting comment:', err);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    if (!video) return <div className="loading">Loading...</div>;

    return (
        <div className="watch-container">
            <div className="video-section">
                <div className="video-player-wrapper">
                    <video controls poster={video.thumbnail_url} className="video-player">
                        <source src={video.video_url} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                <h1 className="watch-title">{video.title}</h1>

                <div className="video-actions">
                    <div className="channel-info">
                        <FaUserCircle size={40} color="#aaa" />
                        <div className="channel-text">
                            <h4>Channel Name</h4>
                            <span>100K subscribers</span>
                        </div>
                        <button
                            className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
                            onClick={handleSubscribe}
                            style={{ backgroundColor: isSubscribed ? '#303030' : '#f1f1f1', color: isSubscribed ? '#aaa' : '#0f0f0f' }}
                        >
                            {isSubscribed ? 'Subscribed' : 'Subscribe'}
                        </button>
                    </div>

                    <div className="action-buttons">
                        <button className="action-btn"><FaThumbsUp /> <span>{video.views} views</span></button>
                        <button className="action-btn"><FaThumbsDown /></button>
                        <button className="action-btn" onClick={handleShare}><FaShare /> <span>Share</span></button>
                    </div>
                </div>

                <div className="description-box">
                    <p>{video.description}</p>
                </div>

                <div className="comments-section">
                    <h3>{comments.length} Comments</h3>
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <FaUserCircle size={40} color="#aaa" />
                        <div className="input-wrapper">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button type="submit" disabled={!newComment}>Comment</button>
                        </div>
                    </form>

                    <div className="comments-list">
                        {comments.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <FaUserCircle size={40} color="#aaa" />
                                <div className="comment-content">
                                    <div className="comment-header">
                                        <span className="comment-author">{comment.username || 'User'}</span>
                                        <span className="comment-date">1 day ago</span>
                                    </div>
                                    <p>{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="recommendations">
                {/* Placeholder for recommended videos */}
                <h3>Recommended</h3>
            </div>
        </div>
    );
};

export default Watch;
