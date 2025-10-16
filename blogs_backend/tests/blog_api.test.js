const { test, beforeEach, after, describe } = require('node:test');
const mongoose = require('mongoose');
const assert = require('node:assert');
const app = require('../app');
const supertest = require('supertest');
const Blog = require('../models/blog');
const helper = require('./test_helper');
const User = require('../models/user');
const bcryptjs = require('bcryptjs');

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

describe('With authenticated user', () => {
  let token;
  let blogWithUser;

  beforeEach(async() => {
    await User.deleteMany({});
    const user = new User({
      name: "Edwin Albanez",
      username: "albanez26",
      passwordHash: await bcryptjs.hash("secure", 10)
    });
    await user.save();

    const { body } = await api.post('/api/login')
      .send({ username: 'albanez26', password: 'secure' })
      .expect(200);

    token = body.token;

    const { body: createdBlog } = await api.post('/api/blogs')
      .send({
        title: "API Testing",
        author: "Camila Monterroza",
        url: "https://devs.example.com/api-testing",
        likes: 167
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201);

    blogWithUser = createdBlog;
  });

  describe('Create blogs', () => {
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
        .set({ authorization: `Bearer ${token}` })
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const { body: blogsAfterPost } = await api.get('/api/blogs').expect(200);
      assert.strictEqual(blogsAfterPost.length, initialBlogs.length + 1);

      delete addedBlog.id;
      delete addedBlog.user;
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
        .set({ authorization: `Bearer ${token}` })
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
        .set({ authorization: `Bearer ${token}` })
        .expect(400);
    });

    test('Fails if token is not provided', async () => {
      const { body: initialBlogs } = await api.get('/api/blogs').expect(200);

      const blogToAdd = {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
      }
      await api.post('/api/blogs')
        .send(blogToAdd)
        .set({ authorization: '' })
        .expect(401);

      const { body: blogsAfterPost } = await api.get('/api/blogs').expect(200);
      assert.strictEqual(blogsAfterPost.length, initialBlogs.length);
    });

  });

  describe('Delete blogs', () => {

    test('Succeeds with an existing id', async () => {
      await api
        .delete(`/api/blogs/${blogWithUser.id}`)
        .set({ authorization: `Bearer ${token}` })
        .expect(204);

      await api
        .get(`/api/blogs/${blogWithUser.id}`)
        .expect(404);
    });

    test('Error with status code 404 if id does not exist', async () => {
      const nonExistingId = await helper.fakeId();
      await api
        .delete(`/api/blogs/${nonExistingId}`)
        .set({ authorization: `Bearer ${token}` })
        .expect(404);
    });

    test('Error with status code 400 if id is invalid', async () => {
      const invalidId = '123';
      await api
        .delete(`/api/blogs/${invalidId}`)
        .set({ authorization: `Bearer ${token}` })
        .expect(400);
    });
  });

  describe('Like a blog', () => {
    test('Succeeds with an existing id', async () => {
      const [blog] = await helper.blogsInDB();
      const { body: updatedBlog } = await api
        .put(`/api/blogs/${blog.id}/likes`)
        .set({ authorization: `Bearer ${token}` })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.strictEqual(updatedBlog.likes, blog.likes + 1);
    });

    test('Error with status code 404 if id does not exist', async () => {
      const nonExistingId = await helper.fakeId();
      await api
        .put(`/api/blogs/${nonExistingId}/likes`)
        .set({ authorization: `Bearer ${token}` })
        .expect(404);
    });

    test('Error with status code 400 if id is invalid', async () => {
      const invalidId = '123';
      await api
        .put(`/api/blogs/${invalidId}/likes`)
        .set({ authorization: `Bearer ${token}` })
        .expect(400);
    });
  });

});

after(async () => {
  await mongoose.connection.close();
})