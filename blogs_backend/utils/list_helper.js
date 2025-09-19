const maxBy = require('lodash.maxby');
const countBy = require('lodash.countby');

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return 0
  }

  if (blogs.length === 1) {
    return blogs[0].likes
  }

  const total = blogs.reduce((total, blog) => total + (blog.likes || 0), 0)

  return total
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

  //countBy returns { 'Michael Chan': 1, 'Edsger W. Dijkstra': 2, 'Robert C. Martin': 3 }

  const blogsByAuthor = Object.entries(countBy(blogs, 'author'))
    .map(([author, blogs]) => ({ author, blogs }));

  const mostBlogsAuthor = maxBy(blogsByAuthor, 'blogs');
  return mostBlogsAuthor;
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}