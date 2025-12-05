import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCompass, FaPlayCircle, FaHistory, FaYoutube } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <Link to="/" className={`sidebar-item ${isActive('/')}`}>
                    <FaHome size={22} />
                    <span>Home</span>
                </Link>
                <div className="sidebar-item">
                    <FaCompass size={22} />
                    <span>Explore</span>
                </div>
                <div className="sidebar-item">
                    <FaPlayCircle size={22} />
                    <span>Shorts</span>
                </div>
                <Link to="/feed" className={`sidebar-item ${isActive('/feed')}`}>
                    <FaYoutube size={22} />
                    <span>Subscriptions</span>
                </Link>
                <div className="sidebar-item">
                    <FaHistory size={22} />
                    <span>History</span>
                </div>
            </div>
            <hr className="sidebar-divider" />
            {/* More sections can be added here */}
        </aside>
    );
};

export default Sidebar;
