const Note = require('../models/Note');

// Get Note for a specific video
exports.getNote = async (req, res) => {
    const { playlistId, videoId } = req.params;
    try {
        const note = await Note.findOne({
            user: req.user._id,
            playlist: playlistId,
            videoId: videoId
        });
        res.json(note || { content: '' }); // Return empty if no note exists
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Save/Update Note
exports.saveNote = async (req, res) => {
    const { playlistId, videoId, content } = req.body;
    try {
        const note = await Note.findOneAndUpdate(
            {
                user: req.user._id,
                playlist: playlistId,
                videoId: videoId
            },
            { content, updatedAt: Date.now() },
            { new: true, upsert: true }
        );
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
