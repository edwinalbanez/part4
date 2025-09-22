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
  }
  next(error);
}

module.exports = {
  unknowEndpoint,
  errorHandler
}