const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/testdb');
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Post model', () => {
  it('should create a new post with valid data', async () => {
    const user = new User({
      username: 'testuser',
      password: 'password123',
    });

    await user.save();

    const post = new Post({
      title: 'Test Post',
      content: 'This is a test post',
      author: user._id,
    });

    expect(post.title).toBe('Test Post');
    expect(post.content).toBe('This is a test post');
    expect(post.author.toString()).toBe(user._id.toString());
  }, 10000);
});


