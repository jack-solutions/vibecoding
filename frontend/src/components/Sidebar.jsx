import { Link } from 'react-router-dom';
import { FaHome, FaHistory, FaThumbsUp } from 'react-icons/fa';
import { MdSubscriptions, MdVideoLibrary } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <div className="sidebar">
            <div className="sidebar-item">
                <Link to="/">
                    <FaHome size={20} />
                    <span>Home</span>
                </Link>
            </div>

            {user && (
                <>
                    <div className="sidebar-item">
                        <Link to="/feed/subscriptions">
                            <MdSubscriptions size={20} />
                            <span>Subscriptions</span>
                        </Link>
                    </div>
                    <div className="sidebar-item">
                        <Link to="/playlists/my">
                            <MdVideoLibrary size={20} />
                            <span>Library</span>
                        </Link>
                    </div>
                </>
            )}

            <div className="sidebar-item">
                <Link to="/feed/history">
                    <FaHistory size={20} />
                    <span>History</span>
                </Link>
            </div>

            {user && (
                <div className="sidebar-item">
                    <Link to="/liked-videos">
                        <FaThumbsUp size={20} />
                        <span>Liked Videos</span>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
