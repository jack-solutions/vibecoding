import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaYoutube, FaSearch, FaMicrophone, FaRegBell, FaVideo, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { currentUser, login } = useAuth();

    const handleUserChange = (e) => {
        const role = e.target.value;
        const users = {
            admin: { id: 1, username: 'Admin User', role: 'admin' },
            creator: { id: 2, username: 'Creator User', role: 'creator' },
            viewer: { id: 3, username: 'Viewer User', role: 'viewer' },
            advertiser: { id: 4, username: 'Advertiser User', role: 'advertiser' },
            guest: null
        };
        login(users[role]);
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-btn">
                    <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" className="style-scope yt-icon" style={{ pointerEvents: 'none', display: 'block', width: '24px', height: '24px', fill: 'white' }}><g className="style-scope yt-icon"><path d="M21,6H3V5h18V6z M21,11H3v1h18V11z M21,17H3v1h18V17z" className="style-scope yt-icon"></path></g></svg>
                </button>
                <Link to="/" className="logo-container">
                    <FaYoutube size={30} color="#FF0000" />
                    <span className="logo-text">YouTube</span>
                </Link>
            </div>

            <div className="header-center">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="search-btn">
                        <FaSearch />
                    </button>
                </div>
                <button className="mic-btn">
                    <FaMicrophone />
                </button>
            </div>

            <div className="header-right">
                <select
                    onChange={handleUserChange}
                    value={currentUser ? currentUser.role : 'guest'}
                    className="role-switcher"
                    style={{ marginRight: '10px', padding: '5px', borderRadius: '4px', background: '#202020', color: 'white', border: '1px solid #444' }}
                >
                    <option value="admin">Admin</option>
                    <option value="creator">Creator</option>
                    <option value="viewer">Viewer</option>
                    <option value="advertiser">Advertiser</option>
                    <option value="guest">Guest</option>
                </select>

                {currentUser && (currentUser.role === 'admin' || currentUser.role === 'creator') && (
                    <Link to="/upload" className="icon-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaVideo />
                    </Link>
                )}

                <button className="icon-btn"><FaRegBell /></button>
                <button className="profile-btn" title={currentUser ? `${currentUser.username} (${currentUser.role})` : 'Guest'}>
                    <FaUserCircle size={30} />
                </button>
            </div>
        </header>
    );
};

export default Header;
