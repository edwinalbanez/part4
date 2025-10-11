const express = require('express')
const config = require('./utils/config')
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

const app = express()

logger.info('Connecting to MongoDB...')

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Conected to MongoDB!')
  })
  .catch(error => {
    logger.error('Could not connect to MongoDB.')
    logger.error(error)
  })

app.use(cors())
app.use(express.json())
process.env.NODE_ENV !== 'test' && app.use(morgan('tiny'))

app.use(middleware.tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknowEndpoint)
app.use(middleware.errorHandler)

module.exports = app