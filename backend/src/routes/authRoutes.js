const express = require('express');
const { register, login, getProfile, logout } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
