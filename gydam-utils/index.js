'use-strict'

const chalk = require('chalk')

function parsePayload (payload) {
  if (payload instanceof Buffer) payload = payload.toString('utf8')

  try {
    return JSON.parse(payload)
  } catch (e) {
    return {}
  }
}

function handleExpressError(err, req, res, next) {
  console.log(`Error: ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }

  res.status(500).send({ error: err.message })
}

function handleFatalError (err) {
  console.error(chalk.red('[fatal error]'), err.message)
  console.error(err.stack)
  process.exit(1)
}

function pipe (source, target) {
  if(!source.emit || !target.emit) throw TypeError('Please pass EventEmitters as arguments')

  const emit = source._emit = source.emit

  source.emit = function () {
    emit.apply(source, arguments)
    target.emit.apply(target, arguments)
    return source
  }
}

module.exports = {
  parsePayload,
  handleExpressError,
  handleFatalError,
  pipe
}
