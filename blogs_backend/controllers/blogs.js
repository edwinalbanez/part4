const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { name: 1, username: 1 });

  response.json(blogs);
});

const getTokenFrom = request => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }

  return null
}

blogsRouter.post('/', async (request, response) => {
  const token = getTokenFrom(request);
  if (!token) {
    return response.status(403).json({
      error: 'Token is missing'
    })
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (!decodedToken.id) {
    return response.status(403).json({
      error: 'Invalid token'
    });
  }

  const user = await User.findById(decodedToken.id);
  if (!user) {
    return response.status(403).json({
      error: 'User not found'
    });
  }

  const { title, author, url } = request.body;
  const blog = new Blog({ title, author, url });
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