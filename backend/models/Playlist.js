const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    videoId: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    thumbnail: String,
    channelTitle: String,
    position: Number,
    durationISO: String,
    durationSeconds: { type: Number, default: 0 } // Normalized duration in seconds
}, { _id: false });

const playlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user who imported this
    youtubeId: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    thumbnail: String,
    channelTitle: String,
    videoCount: { type: Number, default: 0 },
    videos: [videoSchema],
    totalDurationSeconds: { type: Number, default: 0 },
    importedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Playlist', playlistSchema);
