const maxBy = require('lodash.maxby');
const countBy = require('lodash.countby');
const groupBy = require('lodash.groupby');

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return 0;
  }

  if (blogs.length === 1) {
    return blogs[0].likes;
  }

  const total = blogs.reduce((total, blog) => total + (blog.likes || 0), 0);
  return total;
}

const favoriteBlog = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return null;
  }

  if (blogs.length === 1) {
    const { title, author, likes } = blogs[0];
    return {
      title,
      author,
      likes
    };
  }

  const { title, author, likes } = blogs.reduce((favorite, blog) =>
    blog.likes > favorite.likes ? blog : favorite, { likes:0 }
  )

  return {
    title,
    author,
    likes
  };
}

const mostBlogs = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return null;
  }

  if (blogs.length === 1) {
    return {
      author: blogs[0].author,
      blogs: 1
    }
  }

  const blogCountByAuthor = Object.entries(countBy(blogs, 'author'))
    .map(([author, blogs]) => ({ author, blogs }));

  return maxBy(blogCountByAuthor, 'blogs');
}

const mostLikes = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return null;
  }

  if (blogs.length === 1) {
    return {
      author: blogs[0].author,
      likes: blogs[0].likes
    }
  }

  const totalLikesByAuthor = Object.entries(groupBy(blogs, 'author'))
    .map(([author, blogs]) => ({
      author,
      likes: totalLikes(blogs)
    }));

  return maxBy(totalLikesByAuthor, 'likes');
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}