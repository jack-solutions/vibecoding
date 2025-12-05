import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5001/videos")
      .then(res => setVideos(res.data));
  }, []);

  return (
    <div>
      <h2>YouTube Clone</h2>
      {videos.map(v => (
        <div key={v._id}>
          <Link to={`/watch/${v._id}`}>
            <h3>{v.title}</h3>
          </Link>
        </div>
      ))}
    </div>
  );
}
