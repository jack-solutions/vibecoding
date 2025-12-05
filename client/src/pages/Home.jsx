import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import './Home.css';

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/videos');
                setVideos(res.data);
            } catch (err) {
                console.error('Error fetching videos:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="home-container">
            {videos.map(video => (
                <VideoCard key={video.id} video={video} />
            ))}
        </div>
    );
};

export default Home;
