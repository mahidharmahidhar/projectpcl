const express = require('express');
const router = express.Router();
const { register, login, googleSignIn, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google-signin', googleSignIn);
router.get('/profile', protect, getUserProfile);

module.exports = router;
