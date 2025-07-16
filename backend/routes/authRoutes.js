const express = require('express');
const router = express.Router();
const { login, verify } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/verify', verifyToken, (req, res) => {
    try {
        res.json({ valid: true, user: req.user });
    } catch (error) {
        res.status(401).json({ valid: false, error: 'Invalid token' });
    }
});
router.post('/logout', verifyToken, (req, res) => {
    try {
        // You could add token to a blacklist here if needed
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
