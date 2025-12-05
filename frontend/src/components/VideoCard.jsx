import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns'; // Need to install date-fns or use basic formatter

const VideoCard = ({ video }) => {
    return (
        <div className="video-card">
            <Link to={`/watch/${video._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="thumbnail-container">
                    {/* Placeholder for real thumbnail or use video element poster */}
                    <img src={video.thumbnailUrl || 'https://via.placeholder.com/320x180'} alt={video.title} />
                </div>
                <div className="video-info">
                    {/* Channel Avatar */}
                    {video.creator && (
                        <img
                            src={video.creator.avatar || 'https://via.placeholder.com/36'}
                            alt={video.creator.username}
                            style={{ width: 36, height: 36, borderRadius: '50%' }}
                        />
                    )}
                    <div className="video-details">
                        <h3>{video.title}</h3>
                        <p>{video.creator?.username}</p>
                        <p>
                            {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default VideoCard;
