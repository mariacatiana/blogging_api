const mongoose = require('mongoose');
const User = require('../models/user');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/testdb');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();  
});

describe('User model', () => {
  it('should create a new user with valid data', async () => {
    const user = new User({
      username: 'testuser',
      password: 'password123',
    });

    await user.save();

    expect(user.username).toBe('testuser');
    expect(user.password).toBe('password123');
  });

  it('should not create a user with a short username', async () => {
    const user = new User({
      username: 'abc',
      password: 'password123',
    });

    let error = null;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(error.errors['username']).toBeDefined();
  });

  it('should not create a user without a password', async () => {
    const user = new User({
      username: 'testuser',
    });

    let error = null;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(error.errors['password']).toBeDefined();
  });
});
