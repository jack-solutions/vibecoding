import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt } from 'react-icons/fa';
import './Upload.css';

const Upload = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!videoFile || !thumbnailFile) {
            alert('Please select both video and thumbnail files.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('video', videoFile);
        formData.append('thumbnail', thumbnailFile);
        formData.append('user_id', 1); // Mock user ID

        try {
            setUploading(true);
            await axios.post('http://localhost:5000/api/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Upload successful!');
            navigate('/');
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed. See console for details.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <div className="upload-wrapper">
                <div className="upload-header">
                    <FaCloudUploadAlt size={50} color="#3ea6ff" />
                    <h1>Upload Video</h1>
                </div>

                <form onSubmit={handleUpload} className="upload-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Video title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell viewers about your video"
                            rows="4"
                        />
                    </div>

                    <div className="file-input-group">
                        <label className="file-label">
                            <span>Video File</span>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files[0])}
                                required
                            />
                        </label>
                        {videoFile && <div className="file-name">{videoFile.name}</div>}
                    </div>

                    <div className="file-input-group">
                        <label className="file-label">
                            <span>Thumbnail</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setThumbnailFile(e.target.files[0])}
                                required
                            />
                        </label>
                        {thumbnailFile && <div className="file-name">{thumbnailFile.name}</div>}
                    </div>

                    <button type="submit" className="upload-btn" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Upload;
