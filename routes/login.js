const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET_KEY; 

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Username and password are required
 *       401:
 *         description: Username not found or incorrect password
 *       500:
 *         description: An unexpected error occurred
 */
router.post('/', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }
    try {
        const userDoc = await User.findOne({ username });
        if (!userDoc) {
            return res.status(401).json({ error: 'Username not found. Please check your username and try again.' });
        }

        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
                if (err) {
                    throw err;
                }
                res.cookie('token', token, { httpOnly: true }).json({
                    success: true,
                    username: userDoc.username,
                    id: userDoc._id
                });
            });
        } else {
            res.status(401).json({ error: 'Incorrect password. Please check your password and try again.' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
});

module.exports = router;

