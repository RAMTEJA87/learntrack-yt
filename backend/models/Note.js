const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    playlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', required: true },
    videoId: { type: String, required: true },
    content: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
});

// One note per user per video
noteSchema.index({ user: 1, playlist: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('Note', noteSchema);
