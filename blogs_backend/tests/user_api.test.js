const { test, describe, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');
const helper = require('./test_helper');
const app = require('../app');

const api = supertest(app);

describe('Invalid users are not created (exercise 4.16)', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcryptjs.hash('secure', 10);
    const user = new User({
      name: 'Test',
      username: 'root',
      passwordHash
    });

    await user.save();
  });

  test('Missing username', async () => {
    const initialUsers = await helper.usersInDB();
    const { body } = await api.post('/api/users')
      .send({
        name: 'Edwin',
        password: 'secure'
      })
      .expect(400)

    const usersAfterPost = await helper.usersInDB();

    assert(initialUsers.length === usersAfterPost.length);
    assert(body.error === 'Username is missing');
  });

  test('Short username', async () => {
    const initialUsers = await helper.usersInDB();
    const { body } = await api.post('/api/users')
      .send({
        name: 'Edwin',
        username: 'ed',
        password: 'secure'
      })
      .expect(400)

    const usersAfterPost = await helper.usersInDB();

    assert(initialUsers.length === usersAfterPost.length);
    assert(body.error.username === 'Username must be at least 3 characters');
  });

  test('Duplicate username', async () => {
    const initialUsers = await helper.usersInDB();
    const { body } = await api.post('/api/users')
      .send({
        name: 'Edwin',
        username: 'root',
        password: 'secure'
      })
      .expect(409);

    const usersAfterPost = await helper.usersInDB();

    assert(initialUsers.length === usersAfterPost.length);
    assert(body.error === 'This username is already in use');
  })

  test('Missing password', async () => {
    const initialUsers = await helper.usersInDB();
    const { body } = await api.post('/api/users')
      .send({
        name: 'Edwin',
        username: 'albanez'
      })
      .expect(400);

    const usersAfterPost = await helper.usersInDB();

    assert(initialUsers.length === usersAfterPost.length);
    assert(body.error === 'Password is missing');
  });

  test('Short password', async () => {
    const initialUsers = await helper.usersInDB();
    const { body } = await api.post('/api/users')
      .send({
        name: 'Edwin',
        username: 'albanez',
        password: 'ok'
      })
      .expect(400);

    const usersAfterPost = await helper.usersInDB();

    assert(initialUsers.length === usersAfterPost.length);
    assert(body.error === 'Password must be at least 3 characters');
  });
});

after(async () => {
  await mongoose.connection.close();
})