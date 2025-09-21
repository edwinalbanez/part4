const unknowEndpoint = (request, response) => {
  response.status(404).json({
    error: 'unknow endopoint'
  })
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Incorrect format id.' });

  } else if (error.name === 'ValidationError') {

    const fieldsWithError = Object.keys(error.errors);
    const errors = [];

    fieldsWithError.forEach(field => {

      if (field === 'name') {
        const { kind: reason } = error.errors.name;

        switch (reason) {
          case 'required':
            errors.push('The name is required.');
            break;
          case 'minlength':
            errors.push('The name must have at least 3 characters.');
            break;
          default:
            errors.push('Incorrect name format.');
            break;
        }
      }

      if (field === 'number') {
        const { kind: reason } = error.errors.number;

        switch (reason) {
          case 'required':
            errors.push('The number is required.');
            break;
          case 'minlength':
            errors.push('The number must have at least 8 digits.')
            break;
          case 'user defined':
            errors.push('Wrong number format, try something like 12-1234567 or 123-12345678.');
            break;
          default:
            errors.push('Incorrect number format.');
            break;
        }
      }
    });

    return response.status(400).json({ error: errors.join(' ') });
  }

  next(error);
}

module.exports = {
  unknowEndpoint,
  errorHandler
}