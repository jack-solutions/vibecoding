import { useEffect, useState } from 'react';
import axios from 'axios';
import VideoCard from '../components/VideoCard';
import { useLocation } from 'react-router-dom';

const Home = () => {
    const [videos, setVideos] = useState([]);
    const location = useLocation();

    // Parse query params for search
    const query = new URLSearchParams(location.search).get('keyword') || '';

    useEffect(() => {
        const fetchVideos = async () => {
            const { data } = await axios.get(`http://localhost:5000/api/videos?keyword=${query}`);
            setVideos(data);
        };
        fetchVideos();
    }, [query]);

    return (
        <div className="video-grid">
            {videos.map(video => (
                <VideoCard key={video._id} video={video} />
            ))}
        </div>
    );
};

export default Home;
