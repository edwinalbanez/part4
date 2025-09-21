const { test, beforeEach, after } = require('node:test');
const mongoose = require('mongoose');
const assert = require('node:assert');
const app = require('../app');
const supertest = require('supertest');
const Blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach( async () => {
  await Blog.deleteMany({});

  const blogs = helper.initialBlogs.map(blog => new Blog(blog));
  const promiseArray = blogs.map(blog => blog.save());
  await Promise.all(promiseArray);
});

test('Blogs are returned as JSON', async () => {
  const { body: blogs } = await api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const expectedQuantity = helper.initialBlogs.length;
  assert.strictEqual(blogs.length, expectedQuantity);
});

test('The "id" property exists in all blogs', async () => {
  const { body: blogs } = await api.get('/api/blogs').expect(200);

  const idIsDefined = blogs.every(blog => 'id' in blog);
  assert(idIsDefined);
})

after(async () => {
  await mongoose.connection.close();
})