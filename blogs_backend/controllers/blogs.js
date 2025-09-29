const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { name: 1, username: 1 });

  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const { body } = request;
  const blog = new Blog(body);

  const user = await User.findOne({});
  blog.user = user._id;

  const addedBlog = await blog.save();
  user.blogs = user.blogs.concat(addedBlog._id);
  await user.save();

  response.status(201).json(addedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deletedBlog = await Blog.findByIdAndDelete(id);
  if (deletedBlog) {
    response.status(204).end();
  } else {
    response.status(404).json({ error: 'Blog not found' });
  }
});

blogsRouter.put('/:id/likes', async (request, response) => {
  const { id } = request.params;
  const blogToUpdate = await Blog.findById(id);

  if (!blogToUpdate) {
    return response.status(404).json({ error: 'Blog not found' });
  }

  blogToUpdate.likes += 1;
  const updatedBlog = await blogToUpdate.save();
  response.json(updatedBlog);
});

module.exports = blogsRouter;