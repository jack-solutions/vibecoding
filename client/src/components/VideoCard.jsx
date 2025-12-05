import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './VideoCard.css';

const VideoCard = ({ video }) => {
    return (
        <Link to={`/watch/${video.id}`} className="video-card">
            <div className="thumbnail-container">
                <img src={video.thumbnail_url} alt={video.title} className="thumbnail" />
                <span className="duration">12:34</span>
            </div>
            <div className="video-info">
                <div className="avatar">
                    <FaUserCircle size={36} color="#aaa" />
                </div>
                <div className="details">
                    <h3 className="title">{video.title}</h3>
                    <p className="channel-name">Channel Name</p>
                    <div className="meta">
                        <span>{video.views} views</span>
                        <span className="dot">•</span>
                        <span>1 day ago</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default VideoCard;
