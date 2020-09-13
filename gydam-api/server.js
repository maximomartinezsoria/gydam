'use strict'

const express = require('express')
const chalk = require('chalk')
const bodyParser = require('body-parser')
const debug = require('debug')('gydam:api')
const { handleExpressError, handleFatalError } = require('gydam-utils')

const port = process.env.PORT || 3000
const app = express()

const api = require('./api')

app.use(bodyParser.json())
app.use('/api', api)

// Express error handler
app.use(handleExpressError)

if (!module.parent) {
  process.on('uncaughtException', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  app.listen(port, () => {
    console.log(chalk.bgMagenta('[gydam-api]'), ' listening on port ', port)
  })
}

module.exports = app
