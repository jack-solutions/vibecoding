import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdSearch, MdVideoCall, MdNotifications, MdAccountCircle } from "react-icons/md";

const DEFAULT_ROLE = "creator";

export default function Navbar() {
    const [search, setSearch] = useState("");
    const [role, setRole] = useState(DEFAULT_ROLE);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/search?q=${encodeURIComponent(search)}`);
        }
    };

    return (
        <nav style={styles.nav}>
            {/* Left: Logo */}
            <div style={styles.left}>
                <Link to="/" style={styles.logoLink}>
                    <img src="/youtube-logo.png" alt="YouTube Clone" style={styles.logoImg} />
                </Link>
            </div>

            {/* Center: Search */}
            <form onSubmit={handleSearch} style={styles.searchForm}>
                <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />
                <button type="submit" style={styles.searchBtn}>
                    <MdSearch size={20} />
                </button>
            </form>

            {/* Right: Icons */}
            <div style={styles.right}>
                {(role === "creator" || role === "admin") && (
                    <Link to="/upload" style={styles.iconBtn} title="Upload">
                        <MdVideoCall size={28} />
                    </Link>
                )}
                <Link to="/notifications" style={styles.iconBtn} title="Notifications">
                    <MdNotifications size={28} />
                </Link>
                <Link to="/profile" style={styles.iconBtn} title="Profile">
                    <MdAccountCircle size={28} />
                </Link>

                {/* Role toggle */}
                <select value={role} onChange={(e) => {
                    setRole(e.target.value);
                    localStorage.setItem("role", e.target.value);
                }}
                    style={styles.roleSelect}>
                    <option value="admin">Admin</option>
                    <option value="creator">Creator</option>
                    <option value="viewer">Viewer</option>
                    <option value="guest">Guest</option>
                    <option value="advertiser">Advertiser</option>
                </select>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "56px",
        padding: "0 16px",
        backgroundColor: "#181818", // dark theme
        borderBottom: "1px solid #333",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        color: "#fff",
    },
    left: { display: "flex", alignItems: "center" },
    logoLink: { display: "flex", alignItems: "center" },
    logoImg: { height: "40px", width: "auto", objectFit: "contain" },
    searchForm: { flex: 1, display: "flex", maxWidth: "600px", margin: "0 16px" },
    searchInput: {
        flex: 1,
        padding: "6px 12px",
        border: "none",
        borderRadius: "2px 0 0 2px",
        outline: "none",
    },
    searchBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 12px",
        border: "none",
        borderRadius: "0 2px 2px 0",
        backgroundColor: "#333",
        color: "#fff",
        cursor: "pointer",
    },
    right: { display: "flex", alignItems: "center", gap: "12px" },
    iconBtn: { color: "#fff", cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center" },
    roleSelect: {
        padding: "4px 8px",
        borderRadius: "2px",
        border: "1px solid #333",
        backgroundColor: "#181818",
        color: "#fff",
        cursor: "pointer",
    },
};
