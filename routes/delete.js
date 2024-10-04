const express = require('express');
const router = express.Router();
const Post = require('../models/post'); 

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Deletes a post by its ID. Only the author of the post can delete it. Authentication is required via a token stored in cookies.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to delete
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post deleted successfully
 *       401:
 *         description: Not authenticated or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Not authenticated
 *       403:
 *         description: Unauthorized - user is not the author of the post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Post not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        try {
            const post = await Post.findById(id);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            if (post.author.toString() !== info.id) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            await Post.findByIdAndDelete(id);
            res.json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

module.exports = router;