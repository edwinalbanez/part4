const unknowEndpoint = (request, response) => {
  response.status(404).json({
    error: 'unknow endopoint'
  })
}

module.exports = {
  unknowEndpoint
}