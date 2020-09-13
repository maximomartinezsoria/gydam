'use strict'

const EventEmitter = require('events')
const debug = require('debug')('gydam:agent')
const mqtt = require('mqtt')
const { parsePayload } = require('gydam-utils')
const uuid = require('uuid')
const os = require('os')
const util = require('util')

const options = {
  name: 'untitled',
  username: 'gydam',
  interval: 5000,
  mqtt: {
    host: 'mqtt://localhost'
  }
}

class GydamAgent extends EventEmitter {
  constructor (opts) {
    super()

    this._options = { ...options, opts }
    this._started = false
    this._timer = null
    this._client = null
    this._agentId = null
    this._metrics = new Map()
  }

  addMetric (type, fn) {
    this._metrics.set(type, fn)
  }

  removeMetric (type) {
    this._metrics.delete(type)
  }

  connect () {
    if (!this._started) {
      const opts = this._options
      this._started = true
      this._client = mqtt.connect(opts.mqtt.host)

      this._client.subscribe('agent/message')
      this._client.subscribe('agent/connected')
      this._client.subscribe('agent/disconnected')

      this._client.on('connect', () => {
        this.emit('connected')

        this._agentId = uuid.v4()

        this._timer = setInterval(async () => {
          const message = {
            agent: {
              uuid: this._agentId,
              username: opts.username,
              name: opts.name,
              hostname: os.hostname() || 'localhost',
              pid: process.pid
            },
            metrics: [],
            timestamp: new Date().getTime()
          }

          if (this._metrics.size > 0) {
            for (let [metric, fn] of this._metrics) {
              if (fn.length === 1) {
                fn = util.promisify(fn)
              }

              message.metrics.push({
                type: metric,
                value: await Promise.resolve(fn()),
                createdAt: new Date()
              })
            }
          }

          debug('Sending', message)
          this._client.publish('agent/message', JSON.stringify(message))
          this.emit('agent/message', message)
        }, opts.interval)
      })

      this._client.on('message', (topic, rawPayload) => {
        const payload = parsePayload(rawPayload)

        let broadcast = false

        switch (topic) {
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message':
            broadcast = payload && payload.agent && payload.agent.uuid !== this._agentId
            break
        }

        if (broadcast) this.emit(topic, payload)
      })

      this._client.on('error', this.disconnect)
    }
  }

  disconnect () {
    if (this._started) {
      clearInterval(this._timer)
      this._started = false
      this.emit('disconnected', this._agentId)
      this._client.end()
    }
  }
}

module.exports = GydamAgent
