const express = require('express');
const router = express.Router();
const multer = require('multer');



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
    }
});
const uploadMiddleware = multer({ storage });

/**
 * @swagger
 * /post:
 *   post:
 *     category: Create a new post
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: cookie
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: formData
 *         name: cover
 *         type: file
 *         required: false
 *         description: The cover image of the post
 *       - in: formData
 *         name: title
 *         type: string
 *         required: true
 *         description: The title of the post
 *       - in: formData
 *         name: category
 *         type: string
 *         required: true
 *         description: The category of the post
 *       - in: formData
 *         name: content
 *         type: string
 *         required: true
 *         description: The content of the post
 *     responses:
 *       200:
 *         description: Post created successfully
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *             category:
 *               type: string
 *             content:
 *               type: string
 *             cover:
 *               type: string
 *             author:
 *               type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Not authenticated or invalid token
 *       500:
 *         description: Error creating post
 */
router.post('/post', uploadMiddleware.single('cover'), async (req, res) => {    
});

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     category: Update a post
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to update
 *       - in: cookie
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: formData
 *         name: cover
 *         type: file
 *         required: false
 *         description: The cover image of the post
 *       - in: formData
 *         name: title
 *         type: string
 *         required: true
 *         description: The title of the post
 *       - in: formData
 *         name: category
 *         type: string
 *         required: true
 *         description: The category of the post
 *       - in: formData
 *         name: content
 *         type: string
 *         required: true
 *         description: The content of the post
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *             category:
 *               type: string
 *             content:
 *               type: string
 *             cover:
 *               type: string
 *             author:
 *               type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Not authenticated or invalid token
 *       403:
 *         description: Not authorized to update this post
 *       500:
 *         description: Error updating post
 */
router.put('/post/:id', uploadMiddleware.single('cover'), async (req, res) => {    
});

/**
 * @swagger
 * /post:
 *   get:
 *     category: Get a list of posts
 *     responses:
 *       200:
 *         description: List of posts
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               content:
 *                 type: string
 *               cover:
 *                 type: string
 *               author:
 *                 type: string
 *       500:
 *         description: Error fetching posts
 */
router.get('/post', async (req, res) => {    
});

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     category: Get a post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve
 *     responses:
 *       200:
 *         description: Post details
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *             category:
 *               type: string
 *             content:
 *               type: string
 *             cover:
 *               type: string
 *             author:
 *               type: string
 *       404:
 *         description: Post not found
 *       500:
 *         description: Error fetching post
 */
router.get('/post/:id', async (req, res) => {   
});


module.exports = router;
