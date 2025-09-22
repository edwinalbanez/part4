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
});

test('A blog was successfully added', async () => {
  const { body: initialBlogs } = await api.get('/api/blogs').expect(200);

  const blogToAdd = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  }
  const { body: addedBlog } = await api.post('/api/blogs')
    .send(blogToAdd)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const { body: blogsAfterPost } = await api.get('/api/blogs').expect(200);
  assert.strictEqual(blogsAfterPost.length, initialBlogs.length + 1);

  delete addedBlog.id;
  assert.deepStrictEqual(blogToAdd, addedBlog);
});

test('Likes are zero by default', async () => {
  const blogToAdd = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/"
  }

  const { body: addedBlog } = await api.post('/api/blogs')
    .send(blogToAdd)
    .expect(201)

  assert('likes' in addedBlog);
  assert(addedBlog.likes === 0);
});

test('Title and URL are required', async () => {
  const blogToAdd = {
    author: "Michael Chan",
    likes: 7
  }

  await api.post('/api/blogs')
    .send(blogToAdd)
    .expect(400);
});

test('Error deleting a non-existent blog', async () => {
  const nonExistingId = await helper.fakeId();
  await api
    .delete(`/api/blogs/${nonExistingId}`)
    .expect(404);
});

test('Delete an existing blog', async () => {
  const [blogToDelete] = await helper.blogsInDB();
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204);
})

after(async () => {
  await mongoose.connection.close();
})