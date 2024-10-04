const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
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
 *         description: User registered successfully
 *       400:
 *         description: Username and password are required
 *       409:
 *         description: Username already exists. Please choose a different username.
 *       500:
 *         description: An unexpected error occurred
 */
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received POST /register');
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }
    
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.status(200).json(userDoc);
    } catch (e) {
        console.error('Error registering user:', e);
        if (e.code === 11000) { 
            // Code 11000 is a MongoDB error code indicating a duplicate key error
            return res.status(409).json({ error: 'Username already exists. Please choose a different username.' });
        }
        res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
});        

module.exports = router;