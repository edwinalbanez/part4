const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const { body } = request;
  const blog = new Blog({ ...body, likes: body.likes ||0 });
  const addedBlog = await blog.save();
  response.status(201).json(addedBlog);
});

module.exports = blogsRouter;