const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
  {
    title: "Introduction to React Hooks",
    author: "María González",
    url: "https://blog.ejemplo.com/react-hooks-intro",
    likes: 245
  },
  {
    title: "Node.js: Building REST APIs",
    author: "Diego López",
    url: "https://backend.ejemplo.com/nodejs-apis-rest",
    likes: 156
  },
  {
    title: "MongoDB: NoSQL Data Modeling",
    author: "Roberto Silva",
    url: "https://database.ejemplo.com/mongodb-modelado",
    likes: 134
  },
  {
    title: "JWT Authentication in Web Applications",
    author: "Patricia Morales",
    url: "https://seguridad.ejemplo.com/autenticacion-jwt",
    likes: 201
  },
  {
    title: "Docker for JavaScript Developers",
    author: "Miguel Torres",
    url: "https://devops.ejemplo.com/docker-javascript",
    likes: 167
  },
];

const fakeId = async () => {
  const blog = new Blog(initialBlogs[0]);
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
}

const blogsInDB = async () => {
  const blogs = await Blog.find({});
  return blogs.map(blog => blog.toJSON());
}

const usersInDB = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON());
}

module.exports = {
  initialBlogs,
  fakeId,
  blogsInDB,
  usersInDB
}