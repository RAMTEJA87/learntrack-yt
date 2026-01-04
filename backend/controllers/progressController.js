const Progress = require('../models/Progress');

exports.updateProgress = async (req, res) => {
    const { playlistId, videoId, status } = req.body;

    try {
        const progress = await Progress.findOneAndUpdate(
            {
                user: req.user._id,
                playlist: playlistId,
                videoId: videoId
            },
            { status, updatedAt: Date.now() },
            { new: true, upsert: true } // Create if doesn't exist
        );
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStats = async (req, res) => {
    // Global stats for user
    try {
        const totalCompleted = await Progress.countDocuments({ user: req.user._id, status: 'COMPLETED' });
        const inProgress = await Progress.countDocuments({ user: req.user._id, status: 'IN_PROGRESS' });

        // This is a basic stats endpoint
        res.json({
            totalCompleted,
            inProgress
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHeatmapData = async (req, res) => {
    try {
        const query = { user: req.user._id, status: 'COMPLETED' };

        // Filter by specific playlist if provided
        if (req.query.playlistId) {
            query.playlist = req.query.playlistId;
        }

        // 1. Get all completed video timestamps
        const activities = await Progress.find(query).select('updatedAt');

        // 2. Group by Date (YYYY-MM-DD)
        const activityMap = {};
        activities.forEach(act => {
            const date = act.updatedAt.toISOString().split('T')[0];
            activityMap[date] = (activityMap[date] || 0) + 1;
        });

        // 3. Convert to Array
        const heatmapData = Object.keys(activityMap).map(date => ({
            date,
            count: activityMap[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(heatmapData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
