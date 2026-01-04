const express = require('express');
const { updateProgress, getStats, getHeatmapData } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, updateProgress);

router.get('/stats', protect, getStats);
router.get('/heatmap', protect, getHeatmapData);

module.exports = router;
