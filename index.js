require('dotenv').config();
console.log("Secret key:", process.env.SECRET_KEY);

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const Post = require('./models/post');
const User = require('./models/user');
const secret = process.env.SECRET_KEY;
const salt = bcrypt.genSaltSync(10);

if (!secret) {
    throw new Error('Secret key is not defined. Please set the SECRET_KEY in the .env file.');
}

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cookieParser());

if (process.env.SWAGGER_ENABLED === 'true') {
    const { swaggerUi, swaggerDocs } = require('./swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    app.use('/register', require('./routes/register'));
    app.use('/login', require('./routes/login'));
    app.use('/profile', require('./routes/profile'));
    app.use('/post', require('./routes/post'));
    app.use('/delete', require('./routes/delete'));
    app.use('/logout', require('./routes/logout'));
}

const mongoURI = process.env.MONGO_URL;

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

const uploadMiddleware = multer({ dest: 'uploads/' });

app.post('/register', async (req, res) => {
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
            return res.status(409).json({ error: 'Username already exists. Please choose a different username.' });
        }
        res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
});

app.post('/login', async (req, res) => {
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

app.get('/profile', (req, res) => {
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

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('cover'), async (req, res) => {
    const { token } = req.cookies;
    console.log('Received POST /post');

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ error: 'Not authenticated' });
    }

    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
            console.log('Token verification failed', err);
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { title, category, content } = req.body;
        console.log('Post data:', { title, category, content });

        if (!title || !category || !content) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let newPath = null;
        let fileNameWithExt = null;
        if (req.file) {
            const { originalname, path } = req.file;
            const parts = originalname.split('.');
            const ext = parts[parts.length - 1];
            newPath = path + '.' + ext;
            fileNameWithExt = req.file.filename + '.' + ext;
            fs.renameSync(path, newPath);
            console.log('File uploaded:', newPath);
        }

        try {
            const postDoc = await Post.create({
                title,
                category,
                content,
                cover: req.file ? `/uploads/${fileNameWithExt}` : null,
                author: info.id, 
            });

            console.log('Post created:', postDoc);
            res.json(postDoc);
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ error: 'Error creating post' });
        }
    });
});

app.put('/post/:id', uploadMiddleware.single('cover'), async (req, res) => {
    const { token } = req.cookies;
    const { id } = req.params;

    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { title, category, content } = req.body;

        if (!title || !category || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let newPath = null;
        let fileNameWithExt = null;
        if (req.file) {
            const { originalname, path } = req.file;
            const parts = originalname.split('.');
            const ext = parts[parts.length - 1];
            newPath = path + '.' + ext;
            fileNameWithExt = req.file.filename + '.' + ext;
            fs.renameSync(path, newPath);
        }

        try {
            const postDoc = await Post.findById(id);

            if (!postDoc) {
                return res.status(404).json({ error: 'Post not found' });
            }

            if (postDoc.author.toString() !== info.id) {
                return res.status(403).json({ error: 'Not authorized to update this post' });
            }

            postDoc.title = title;
            postDoc.category = category;
            postDoc.content = content;
            if (req.file) {
                postDoc.cover = `/uploads/${fileNameWithExt}`;
            }

            await postDoc.save();

            res.json(postDoc);
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ error: 'Error updating post' });
        }
    });
});

app.get('/post', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
});

app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
  
    try {
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid post ID format' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/post/:id', async (req, res) => {
    const { token } = req.cookies;
    const { id } = req.params;

    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        try {
            const postDoc = await Post.findById(id);
            if (!postDoc) {
                return res.status(404).json({ error: 'Post not found' });
            }

            if (postDoc.author.toString() !== info.id) {
                return res.status(403).json({ error: 'Not authorized to delete this post' });
            }

            await postDoc.deleteOne();
            res.status(204).end();
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ error: 'Error deleting post' });
        }
    });
});

app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});



