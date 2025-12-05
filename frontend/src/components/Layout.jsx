import React, { useState } from "react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import {
    MdHome, MdSubscriptions, MdVideoLibrary, MdHistory,
    MdOutlineVideoLibrary, MdOutlineWatchLater, MdAnalytics, MdAdminPanelSettings,
    MdExplore, MdSettings, MdHelp
} from "react-icons/md";

export default function Layout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const role = localStorage.getItem("role") || "creator";

    return (
        <div style={styles.container}>
            {/* Top Navbar */}
            <Navbar />

            <div style={styles.main}>
                {/* Sidebar */}
                <aside style={{ ...styles.sidebar, width: sidebarCollapsed ? "72px" : "240px" }}>
                    <button style={styles.toggleBtn} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                        ☰
                    </button>

                    <nav style={styles.menu}>
                        <Link to="/" style={styles.menuItem}><MdHome size={24} /> {!sidebarCollapsed && "Home"}</Link>
                        <Link to="/subscriptions" style={styles.menuItem}><MdSubscriptions size={24} /> {!sidebarCollapsed && "Subscriptions"}</Link>
                        <Link to="/library" style={styles.menuItem}><MdVideoLibrary size={24} /> {!sidebarCollapsed && "Library"}</Link>
                        <Link to="/history" style={styles.menuItem}><MdHistory size={24} /> {!sidebarCollapsed && "History"}</Link>

                        <hr style={styles.separator} />

                        {(role === "creator" || role === "admin") && (
                            <>
                                <Link to="/upload" style={styles.menuItem}><MdOutlineVideoLibrary size={24} /> {!sidebarCollapsed && "Upload"}</Link>
                                <Link to="/your-videos" style={styles.menuItem}><MdOutlineVideoLibrary size={24} /> {!sidebarCollapsed && "Your Videos"}</Link>
                                <Link to="/watch-later" style={styles.menuItem}><MdOutlineWatchLater size={24} /> {!sidebarCollapsed && "Watch Later"}</Link>
                                <Link to="/analytics" style={styles.menuItem}><MdAnalytics size={24} /> {!sidebarCollapsed && "Analytics"}</Link>
                            </>
                        )}

                        {role === "admin" && (
                            <Link to="/admin" style={styles.menuItem}><MdAdminPanelSettings size={24} /> {!sidebarCollapsed && "Admin"}</Link>
                        )}

                        <hr style={styles.separator} />

                        <Link to="/explore" style={styles.menuItem}><MdExplore size={24} /> {!sidebarCollapsed && "Explore"}</Link>
                        <Link to="/settings" style={styles.menuItem}><MdSettings size={24} /> {!sidebarCollapsed && "Settings"}</Link>
                        <Link to="/help" style={styles.menuItem}><MdHelp size={24} /> {!sidebarCollapsed && "Help"}</Link>
                    </nav>
                </aside>

                {/* Content */}
                <main style={styles.content}>{children}</main>
            </div>
        </div>
    );
}

const styles = {
    container: { display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#fff" },
    main: { display: "flex", flex: 1 },
    sidebar: {
        backgroundColor: "#181818",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        paddingTop: "8px",
        transition: "width 0.3s",
        overflow: "hidden",
    },
    toggleBtn: {
        background: "none",
        border: "none",
        color: "#fff",
        fontSize: "20px",
        margin: "8px",
        cursor: "pointer",
    },
    menu: { display: "flex", flexDirection: "column", marginTop: "16px" },
    menuItem: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "12px 16px",
        color: "#fff",
        textDecoration: "none",
        fontSize: "16px",
        cursor: "pointer",
    },
    separator: {
        border: "0.5px solid #333",
        margin: "8px 0",
    },
    content: {
        flex: 1,
        padding: "16px",
        backgroundColor: "#fff", // white content area
        overflowY: "auto",
        color: "#000", // black text for readability
    },
};
