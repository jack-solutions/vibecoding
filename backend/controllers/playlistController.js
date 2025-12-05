const Playlist = require('../models/Playlist');

// @desc    Create a playlist
// @route   POST /api/playlists
// @access  Private (Creator)
const createPlaylist = async (req, res, next) => {
    try {
        const { name, videoIds, isPublic } = req.body;

        const playlist = await Playlist.create({
            creator: req.user._id,
            name,
            videos: videoIds || [],
            isPublic
        });

        res.status(201).json(playlist);
    } catch (error) {
        next(error);
    }
};

// @desc    Get User Playlists
// @route   GET /api/playlists/my
// @access  Private
const getMyPlaylists = async (req, res, next) => {
    try {
        const playlists = await Playlist.find({ creator: req.user._id });
        res.json(playlists);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPlaylist,
    getMyPlaylists
};
