
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /logout:
 *   post:
 *     category: Logout a user
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
});

module.exports = router;