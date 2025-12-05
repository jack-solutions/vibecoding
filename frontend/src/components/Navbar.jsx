import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaYoutube, FaSearch, FaUserCircle, FaVideo } from 'react-icons/fa';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/?keyword=${keyword}`);
        }
    };

    return (
        <nav className="navbar">
            <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                <FaYoutube size={28} color="red" />
                <span>YouTube</span>
            </Link>

            <form className="search-bar" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <button type="submit" className="search-btn">
                    <FaSearch />
                </button>
            </form>

            <div className="nav-links">
                {user ? (
                    <>
                        {user.role === 'Creator' && (
                            <Link to="/upload" className="nav-btn" title="Create">
                                <FaVideo size={20} />
                            </Link>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaUserCircle size={24} />
                            <span>{user.username}</span>
                            <button onClick={logout} className="nav-btn" style={{ borderColor: '#aaa', color: '#aaa' }}>
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <Link to="/login" className="nav-btn">
                        <FaUserCircle size={20} />
                        Sign in
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
