const express = require('express');
const { getNote, saveNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/:playlistId/:videoId')
    .get(protect, getNote);

router.route('/')
    .post(protect, saveNote);

module.exports = router;
