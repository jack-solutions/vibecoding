import React from "react";
import axios from "axios";
import { useState } from "react";

export default function Upload() {
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState(null);

  const uploadVideo = async () => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("video", video);

    await axios.post("http://localhost:5001/videos/upload", fd);
    alert("Video Uploaded!");
  };

  return (
    <div>
      <h2>Upload Video</h2>
      <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <input type="file" onChange={(e) => setVideo(e.target.files[0])} />
      <button onClick={uploadVideo}>Upload</button>
    </div>
  );
}
