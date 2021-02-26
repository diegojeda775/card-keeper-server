require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const errorHandler = require('./error-handler')
const cardsRouter = require('./cards/cards-router')
const setsRouter = require('./sets/sets-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors({
  origin: CLIENT_ORIGIN
}))

app.use('/api/sets', setsRouter)
app.use('/api/cards', cardsRouter)

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(errorHandler)

module.exports = app