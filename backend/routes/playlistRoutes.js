const express = require('express');
const { addPlaylist, getPlaylists, getPlaylistDetails, deletePlaylist } = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, addPlaylist)
    .get(protect, getPlaylists);

router.route('/:id')
    .get(protect, getPlaylistDetails)
    .delete(protect, deletePlaylist);

module.exports = router;
