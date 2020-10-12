require('dotenv').config()
const sensor = require('ds18b20-raspi')
const GydamAgent = require('gydam-agent')

const agent = new GydamAgent({
  name: 'raspi',
  username: 'raspi',
  interval: 1000,
  mqtt: {
    host: process.env.MQTT_HOST
  }
})

agent.addMetric('temperature', function () {
  return sensor.readSimpleC()
})

agent.connect()

agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)

function handler (payload) {
  console.log(payload)
}
