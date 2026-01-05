const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', require('../middleware/authMiddleware').protect, require('../controllers/authController').getMe);

module.exports = router;
