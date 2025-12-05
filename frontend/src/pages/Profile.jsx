import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// For simplicity, assume USER_ID is the logged-in user
const USER_ID = "your-user-id-here"; // Replace with actual logged-in user id

export default function Profile() {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        // Fetch all videos uploaded by this user
        axios.get("http://localhost:5001/videos")
            .then(res => {
                // Filter videos by creator
                const userVideos = res.data.filter(v => v.creator === USER_ID);
                setVideos(userVideos);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h2>My Channel</h2>
            {videos.length === 0 && <p>No videos uploaded yet</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {videos.map(v => (
                    <div key={v._id} style={{ width: "250px" }}>
                        <Link to={`/watch/${v._id}`}>
                            <video
                                width="100%"
                                controls
                                src={`http://localhost:5001${v.videoUrl}`}
                            />
                            <h3>{v.title}</h3>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
