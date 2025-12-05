const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const videoRoutes = require('./routes/videos');
const commentRoutes = require('./routes/comments');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/subscriptions', require('./routes/subscriptions'));

app.get('/', (req, res) => {
    res.send('YouTube Clone API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
