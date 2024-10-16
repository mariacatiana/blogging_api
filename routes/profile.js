const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /profile:
 *   get:
 *     category: Get user profile
 *     responses:
 *       200:
 *         description: User profile information
 *       401:
 *         description: No token provided or invalid token
 */
router.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ error: 'No token provided.' });
    }
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        res.json(info);
    });
});

module.exports = router;