'use-strict'

const db = require('../')
const chalk = require('chalk')

async function run () {
  const config = {
    database: process.env.DB_NAME || 'gydam',
    username: process.env.DB_USER || 'gydam',
    password: process.env.DB_PASS || 'gydam',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }

  const { Agent, Metric } = await db(config).catch(handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'yyy',
    name: 'test',
    username: 'test',
    hostname: 'test',
    pid: 1,
    connected: true
  }).catch(handleFatalError)

  console.log(chalk.green('--agent--'))
  console.log(agent)

  const agents = await Agent.findAll().catch(handleFatalError)
  console.log(chalk.green('--agents--'))
  console.log(agents)

  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(handleFatalError)

  console.log(chalk.green('--metric--'))
  console.log(metric)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)

  console.log(chalk.green('--metrics by uuid--'))
  console.log(metrics)

  const metricsByType = await Metric.findByTypeAgentUuid('memory', agent.uuid).catch(handleFatalError)

  console.log(chalk.green('--metrics by type--'))
  console.log(metricsByType)
}

function handleFatalError (err) {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)
}

run()
