import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5001/videos")
      .then(res => {
        setVideo(res.data.find(v => v._id === id));
      });
  }, []);

  if (!video) return <p>Loading...</p>;

  return (
    <div>
      <video width="600" controls src={`http://localhost:5001${video.videoUrl}`}></video>
      <h2>{video.title}</h2>
    </div>
  );
}
