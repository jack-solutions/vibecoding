import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <aside className="yt-sidebar">
      <div className="yt-sidebar-section">
        <Link to="/" className="yt-sidebar-item">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4zm9-19L1 12h3v10h7v-6h2v6h7V12h3L13 2z"/>
          </svg>
          <span>Home</span>
        </Link>
        
        <Link to="/" className="yt-sidebar-item">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25zm-.23 5.86-8.5 4.5c-1.34.71-3.01.2-3.72-1.14-.71-1.34-.2-3.01 1.14-3.72l2.04-1.08v-1.21l-.69-.28-1.11-.46c-.99-.41-1.65-1.35-1.7-2.41-.05-1.06.52-2.06 1.46-2.56l8.5-4.5c1.34-.71 3.01-.2 3.72 1.14.71 1.34.2 3.01-1.14 3.72L15.5 9.26v1.21l1.8.74c.99.41 1.65 1.35 1.7 2.41.05 1.06-.52 2.06-1.46 2.56z"/>
          </svg>
          <span>Shorts</span>
        </Link>
        
        <Link to="/" className="yt-sidebar-item">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M10 18v-6l5 3-5 3zm7-15H7v1h10V3zm3 3H4v1h16V6zm2 3H2v12h20V9zM3 10h18v10H3V10z"/>
          </svg>
          <span>Subscriptions</span>
        </Link>
      </div>

      <div className="yt-sidebar-divider"></div>

      {isAuthenticated && (
        <>
          <div className="yt-sidebar-section">
            <div className="yt-sidebar-title">You</div>
            
            {user.role === 'Creator' && (
              <>
                <Link to="/dashboard" className="yt-sidebar-item">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                  </svg>
                  <span>Your channel</span>
                </Link>
                
                <Link to="/upload" className="yt-sidebar-item">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm3-7H3v12h14v-6.39l4 1.83V8.56l-4 1.83V6m1-1v3.83L22 7v8l-4-1.83V19H2V5h16z"/>
                  </svg>
                  <span>Your videos</span>
                </Link>
              </>
            )}
            
            <Link to="/" className="yt-sidebar-item">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M14.97 16.95 10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM22 12c0 5.51-4.49 10-10 10S2 17.51 2 12h1c0 4.96 4.04 9 9 9s9-4.04 9-9-4.04-9-9-9C8.81 3 5.92 4.64 4.28 7.38c-.11.18-.22.37-.31.56L3.94 8H8v1H1.96V3h1v4.74c.04-.09.07-.17.11-.25.11-.22.23-.42.35-.63C5.22 3.86 8.51 2 12 2c5.51 0 10 4.49 10 10z"/>
              </svg>
              <span>History</span>
            </Link>
          </div>

          <div className="yt-sidebar-divider"></div>
        </>
      )}

      {user?.role === 'Admin' && (
        <>
          <div className="yt-sidebar-section">
            <div className="yt-sidebar-title">Admin</div>
            <Link to="/admin" className="yt-sidebar-item">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              <span>Admin Panel</span>
            </Link>
          </div>
          
          <div className="yt-sidebar-divider"></div>
        </>
      )}

      <div className="yt-sidebar-section">
        <div className="yt-sidebar-title">Explore</div>
        
        <Link to="/" className="yt-sidebar-item">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
          </svg>
          <span>Trending</span>
        </Link>
        
        <Link to="/" className="yt-sidebar-item">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
          </svg>
          <span>Music</span>
        </Link>
        
        <Link to="/" className="yt-sidebar-item">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M10 12H8v2H6v-2H4v-2h2V8h2v2h2v2zm7 .5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zm3-3c0-.83-.67-1.5-1.5-1.5S17 8.67 17 9.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zm-3.03-4.35-4.5 2.53-.49.27-.49-.27-4.5-2.53L3 7.39v6.43l8.98 5.04 8.98-5.04V7.39l-3.99-2.24m0-1.15 4.99 2.8v7.6L11.98 20 2 14.4V6.8L6.99 4l4.99 2.8L16.97 4z"/>
          </svg>
          <span>Gaming</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
