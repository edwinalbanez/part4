const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrytjs = require('bcryptjs');

usersRouter.post('/', async (request, response) => {
  const { name, username, password } = request.body;

  if (!password) {
    return response.status(400).json({
      error: 'Password is missing'
    })
  }

  if (password.length < 3) {
    return response.status(400).json({
      error: 'Password must be at least 3 characters'
    });
  }

  if (!(username && username.trim())) {
    return response.status(400).json({
      error: 'Username is missing'
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrytjs.hash(password, saltRounds);

  const user = new User({ name, username, passwordHash });
  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
    .populate('blogs', { likes: 0, user: 0 });

  response.json(users);
})

module.exports = usersRouter;