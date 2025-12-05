import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadVideo = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a video file');

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title);
        formData.append('description', description);

        setUploading(true);

        try {
            await axios.post('http://localhost:5000/api/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });
            setUploading(false);
            navigate('/');
        } catch (error) {
            console.error(error);
            setUploading(false);
            alert('Upload failed');
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '20px auto' }}>
            <h2>Upload Video</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    style={{ padding: '10px', background: '#121212', border: '1px solid #333', color: 'white' }}
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows="5"
                    style={{ padding: '10px', background: '#121212', border: '1px solid #333', color: 'white' }}
                />
                <input
                    type="file"
                    accept="video/mp4,video/x-m4v,video/*"
                    onChange={handleFileChange}
                    style={{ color: 'white' }}
                />
                <button type="submit" disabled={uploading} style={{ padding: '10px', background: '#3ea6ff', border: 'none', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </form>
        </div>
    );
};

export default UploadVideo;
