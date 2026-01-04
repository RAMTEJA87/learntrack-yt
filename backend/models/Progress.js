const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    playlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', required: true },
    videoId: { type: String, required: true },
    status: {
        type: String,
        enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
        default: 'NOT_STARTED'
    },
    updatedAt: { type: Date, default: Date.now }
});

// Ensure a user has only one progress record per video per playlist
progressSchema.index({ user: 1, playlist: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
