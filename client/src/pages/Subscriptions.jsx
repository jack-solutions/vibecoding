import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../context/AuthContext';
import './Home.css'; // Reuse Home CSS for grid

const Subscriptions = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchFeed = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`http://localhost:5000/api/subscriptions/feed/${currentUser.id}`);
                setVideos(res.data);
            } catch (err) {
                console.error('Error fetching subscription feed:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, [currentUser]);

    if (!currentUser) return <div className="loading">Please login to view subscriptions.</div>;
    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="home-container">
            {videos.length === 0 ? (
                <div className="loading">No videos from subscribed channels.</div>
            ) : (
                videos.map(video => (
                    <VideoCard key={video.id} video={video} />
                ))
            )}
        </div>
    );
};

export default Subscriptions;
