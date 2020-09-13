#! /usr/bin/env node

'use strict'

const blessed = require('blessed')
const contrib = require('blessed-contrib')
const GydamAgent = require('gydam-agent')

const agent = new GydamAgent()
const screen = blessed.screen()

const agents = new Map()
const agentMetrics = new Map()
let extended = []
let selected = {
  uuid: null,
  type: null
}

// eslint-disable-next-line new-cap
const grid = new contrib.grid({
  rows: 1,
  cols: 4,
  screen
})

const tree = grid.set(0, 0, 1, 1, contrib.tree, {
  label: 'Connected Agents'
})

const line = grid.set(0, 1, 1, 3, contrib.line, {
  label: 'Metric',
  showLegend: true,
  minY: 0,
  xPadding: 5
})

agent.on('agent/connected', payload => {
  const { uuid } = payload.agent

  if (!agents.has(uuid)) {
    agents.set(uuid, payload.agent)
    agentMetrics.set(uuid, {})
  }

  renderData()
})

agent.on('agent/disconnected', payload => {
  const { uuid } = payload.agent

  if (agents.has(uuid)) {
    agents.delete(uuid)
    agentMetrics.delete(uuid)
  }

  renderData()
})

agent.on('agent/message', payload => {
  const { agent: { uuid }, timestamp } = payload

  if (!agents.has(uuid)) {
    agents.set(uuid, payload.agent)
    agentMetrics.set(uuid, {})
  }

  const metrics = agentMetrics.get(uuid)

  payload.metrics.forEach(m => {
    const { type, value } = m

    if (!Array.isArray(metrics[type])) {
      metrics[type] = []
    }

    const length = metrics[type].length
    if (length >= 20) {
      metrics[type].shift()
    }

    metrics[type].push({
      value,
      timestamp
    })
  })

  renderData()
})

tree.on('select', node => {
  const { uuid, type } = node

  if (node.agent) {
    extended = node.extended ? [...extended, uuid] : extended = extended.filter(e => e !== uuid)
    selected = {
      uuid: null,
      type: null
    }
    return
  }

  selected = { uuid, type }
  renderMetric()
})

function renderData () {
  const treeData = {}

  let idx = 0
  for (const [uuid, val] of agents) {
    const title = `${val.name} - (${val.pid})`
    treeData[title] = {
      uuid,
      agent: true,
      extended: extended.includes(uuid),
      children: {}
    }

    const metrics = agentMetrics.get(uuid)
    Object.keys(metrics).forEach(type => {
      const metric = {
        uuid,
        type,
        metric: true
      }

      const metricName = ` ${type} ${' '.repeat(1000)} ${idx++}`
      treeData[title].children[metricName] = metric
    })
  }

  tree.setData({
    extended: true,
    children: treeData
  })

  renderMetric()
}

function renderMetric () {
  if (!selected.type || !selected.uuid) {
    line.setData([{ x: [], y: [], title: '' }])
    screen.render()
    return
  }

  const metrics = agentMetrics.get(selected.uuid)
  const values = metrics[selected.type]
  const series = [{
    title: selected.type,
    x: values.map(v => v.timestamp).slice(-10),
    y: values.map(v => v.value).slice(-10)
  }]

  line.setData(series)
  screen.render()
}

screen.key(['escape', 'q', 'C-c'], (ch, key) => {
  process.exit(0)
})

agent.connect()
tree.focus()
screen.render()
