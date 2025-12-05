import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5001/videos")
      .then(res => setVideos(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Home</h2>
      {videos.length === 0 && <p>No videos available</p>}
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
