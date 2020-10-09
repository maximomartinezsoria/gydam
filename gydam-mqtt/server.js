'use-strict'

const debug = require('debug')('gydam:mqtt')
const net = require('net')
const chalk = require('chalk')
const redisPersistence = require('aedes-persistence-redis')
const db = require('gydam-db')
const { parsePayload } = require('gydam-utils')

function handleFatalError (error) {
  handleError(error)
  process.exit(1)
}

function handleError (error) {
  console.error(chalk.red(`[fatal-error]: ${error.message}`))
  console.error(error.stack)
}

const config = {
  database: process.env.DB_NAME || 'gydam',
  username: process.env.DB_USER || 'gydam',
  password: process.env.DB_PASS || 'gydam',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: s => debug(s)
}

let Agent, Metric

const aedes = require('aedes')({
  persistence: redisPersistence({
    port: 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    family: 4,
    maxSessionDelivery: 100
  })
})

const server = net.createServer(aedes.handle)
const clients = new Map()

server.listen(1883, async error => {
  if (error) return handleFatalError(error)

  const services = await db(config).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.cyan('[gydam-mqtt]')} server is running`)
})

aedes.on('client', client => {
  debug(`Client Connected: ${client.id}`)
  clients.set(client.id, null)
})

aedes.on('clientDisconnect', async client => {
  const agent = clients.get(client.id)

  if (agent) {
    agent.connected = false

    try {
      await Agent.createOrUpdate(agent)
    } catch (err) {
      return handleError(err)
    }
  }

  clients.delete(client.id)

  aedes.publish({
    topic: 'agent/disconnected',
    payload: JSON.stringify({
      agent: {
        uuid: agent.uuid
      }
    })
  })
  debug(`Client Disconnected: ${client.id}`)
})

aedes.on('publish', async (packet, client) => {
  debug(`Recieved: ${packet.topic}`)

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break

    case 'agent/message': {
      debug(`Payload: ${packet.payload}`)
      const payload = parsePayload(packet.payload)

      let agent
      if (payload.agent) {
        payload.agent.connected = true

        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleFatalError(e)
        }

        debug(`Agent ${agent.uuid} saved`)

        // Notify Agent is connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          aedes.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }
      }

      payload.metrics.map(async metric => {
        let m
        try {
          m = await Metric.create(agent.uuid, metric)
        } catch (e) {
          return handleError(e)
        }

        debug(`Metric ${m.id} saved on agent ${agent.uuid}`)
      })
    }
  }
})

aedes.on('connectionError', handleFatalError)
process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
