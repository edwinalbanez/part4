const jwt = require('jsonwebtoken');
const User = require('../models/user');

const unknowEndpoint = (request, response) => {
  response.status(404).json({
    error: 'unknow endopoint'
  });
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Incorrect format id.' });

  } else if (error.name === 'ValidationError') {
    const messages = {};
    Object.entries(error.errors).forEach(([key, value]) => {
      messages[key] = value.message
    });
    return response.status(400).json({ error: messages });

  } else if (error.name === 'MongooseError') {
    return response.status(409).json({
      error: error.message
    });
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: error.message
    });
  }
  next(error);
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  request.token = authorization && authorization.startsWith('Bearer')
    ? authorization.replace('Bearer ', '')
    : null

  next();
}

const userExtractor = async (request, response, next) => {
  if (!request.token) {
    return response.status(401).json({
      error: 'Token is missing'
    });
  }

  const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET);
  const user = await User.findById(decodedToken.id);
  request.user = user;
  next();
}

module.exports = {
  unknowEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}