'use strict'

const debug = require('debug')('gydam:api:routes')
const express = require('express')
const db = require('gydam-db')
const config = require('./config')
const auth = require('express-jwt')
const guard = require('express-jwt-permissions')()

const api = express.Router()

let services, Agent, Metric

api.use(auth(config.auth))

api.use('*', async (req, res, next) => {
  if (!services) {
    debug('Connecting to database')
    try {
      services = await db(config.db)
    } catch (e) {
      return next(e)
    }

    Agent = services.Agent
    Metric = services.Metric
  }

  next()
})

api.get('/agents', async (req, res, next) => {
  debug('/agents')

  const { user } = req

  if (!user || !user.username) return next(new Error('Not authorized'))

  let agents = []

  try {
    if (user.admin) {
      agents = await Agent.findConnected()
    } else {
      agents = await Agent.findByUsername(user.username)
    }
  } catch (e) {
    return next(e)
  }

  res.send(agents)
})

api.get('/agents/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug('/agents/', uuid)

  let agent

  try {
    agent = await Agent.findByUuid(uuid)
  } catch (e) {
    return next(e)
  }

  if (!agent) return next(new Error(`Agent not found with uuid: ${uuid}`))

  res.send(agent)
})

api.get('/metrics/:uuid', guard.check(['metrics:read']), async (req, res, next) => {
  const { uuid } = req.params
  debug('/metrics/', uuid)

  let metrics = []

  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (e) {
    return next(e)
  }

  if (!metrics || metrics.length < 1) return next(new Error(`Metrics not found for agent with uuid: ${uuid}`))

  res.send(metrics)
})

api.get('/metrics/:uuid/:type', guard.check(['metrics:read']), async (req, res, next) => {
  const { uuid, type } = req.params
  debug(`/metrics/${uuid}/${type}`)

  let metrics = []

  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (e) {
    return next(e)
  }

  if (!metrics || metrics.length < 1) return next(new Error(`Metrics (${type}) not found for agent with uuid: ${uuid}`))

  res.send(metrics)
})

module.exports = api
