const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const loginRouter = require('express').Router();
const User = require('../models/user');

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body;
  const user = await User.findOne({ username });
  if (!user) {
    return response.status(404).json({
      error: 'User not found'
    });
  }

  const passwordCorrect = await bcryptjs.compare(password, user.passwordHash);
  if (!passwordCorrect) {
    return response.status(401).json({
      error: 'Incorrect password'
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(
    userForToken,
    process.env.JWT_SECRET,
    { expiresIn: 60*60 }
  );

  response.status(200).send({
    token,
    username: user.username,
    name: user.name
  });

});

module.exports = loginRouter;