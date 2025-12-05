import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const Watch = () => {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const { user } = useAuth();
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        const fetchVideo = async () => {
            const { data } = await axios.get(`http://localhost:5000/api/videos/${id}`);
            setVideo(data);
        };
        const fetchComments = async () => {
            const { data } = await axios.get(`http://localhost:5000/api/videos/${id}/comments`);
            setComments(data);
        };
        fetchVideo();
        fetchComments();
    }, [id]);

    const handleLike = async () => {
        if (!user) return alert('Please login to like');
        try {
            const { data } = await axios.put(`http://localhost:5000/api/videos/${id}/like`, {}, { withCredentials: true });
            setVideo(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user) return alert('Please login to comment');
        try {
            const { data } = await axios.post(`http://localhost:5000/api/videos/${id}/comments`,
                { content: newComment },
                { withCredentials: true }
            );
            setComments([data, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubscribe = async () => {
        if (!user) return alert('Please login to subscribe');
        if (!video?.creator?._id) return;
        try {
            await axios.put(`http://localhost:5000/api/users/subscribe/${video.channelId || video.creator._id}`, {}, { withCredentials: true }); // Assuming creator is channel owner
            // Refresh video data or update local state
            alert('Subscribed!');
        } catch (error) {
            console.error(error);
            alert('Error subscribing');
        }
    }

    if (!video) return <div>Loading...</div>;

    return (
        <div className="watch-container">
            <div className="player-section">
                <div className="video-player">
                    <video
                        src={video.videoUrl}
                        controls
                        autoPlay
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
                <h2>{video.title}</h2>
                <div className="actions">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                            src={video.creator?.avatar || 'https://via.placeholder.com/40'}
                            style={{ width: 40, height: 40, borderRadius: '50%' }}
                        />
                        <div>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>{video.creator?.username}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>{video.creator?.subscribers?.length || 0} subscribers</p>
                        </div>
                        <button onClick={handleSubscribe} className="action-btn" style={{ background: 'white', color: 'black', fontWeight: 'bold' }}>Subscribe</button>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                        <button onClick={handleLike} className="action-btn">
                            <FaThumbsUp /> {video.likes?.length}
                        </button>
                        <button className="action-btn">
                            <FaThumbsDown /> {video.dislikes?.length}
                        </button>
                    </div>
                </div>
                <div style={{ background: '#222', padding: '10px', marginTop: '10px', borderRadius: '10px' }}>
                    <p>{video.description}</p>
                </div>

                <div className="comments-section" style={{ marginTop: '20px' }}>
                    <h3>{comments.length} Comments</h3>
                    {user && (
                        <form onSubmit={handleComment} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <input
                                type="text"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                style={{ flex: 1, padding: '10px', background: 'transparent', borderBottom: '1px solid #555', borderTop: 'none', borderLeft: 'none', borderRight: 'none', color: 'white', outline: 'none' }}
                            />
                            <button type="submit" disabled={!newComment} style={{ background: '#3ea6ff', border: 'none', padding: '10px 20px', borderRadius: '20px', color: 'black', cursor: 'pointer' }}>Comment</button>
                        </form>
                    )}
                    {comments.map(comment => (
                        <div key={comment._id} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <img src={comment.userId?.avatar || 'https://via.placeholder.com/32'} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                            <div>
                                <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    {comment.userId?.username} <span style={{ fontWeight: 'normal', color: '#aaa', fontSize: '0.8rem' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </p>
                                <p style={{ margin: 0 }}>{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="related-videos">
                {/* Related videos can go here */}
                <h3>Related Videos</h3>
                <p>Coming soon...</p>
            </div>
        </div>
    );
};

export default Watch;
