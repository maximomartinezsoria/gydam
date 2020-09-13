'use strict'

const path = require('path')
const debug = require('debug')('gydam:web')
const chalk = require('chalk')
const express = require('express')
const cors = require('cors')
const socketio = require('socket.io')
const { handleFatalError, pipe, handleExpressError } = require('gydam-utils')
const GydamAgent = require('gydam-agent')
const proxy = require('./proxy')

const port = process.env.PORT || 3001
const app = express()
const agent = new GydamAgent()

app.use(cors('*'))
app.use(express.static(path.join(__dirname, 'dist')))
app.use('/', proxy)

const server = app.listen(port, () => {
  console.log(`${chalk.bgBlue('[gydam-web]')} server listening on http://localhost:${port}`)

  agent.connect()
})

const io = socketio(server)

// Socket.io
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  pipe(agent, socket)
})

app.use(handleExpressError)

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
