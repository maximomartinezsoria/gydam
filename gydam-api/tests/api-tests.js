'use strict'

const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const test = require('ava')
const { agentFixtures, metricFixtures } = require('gydam-utils/fixtures')
const { sign } = require('../auth')
const config = require('../config')

let sandbox = null
let server = null
let dbStub = null
let token = null
const AgentStub = {}
const MetricStub = {}
const uuid = 'yyy-yyy-yyy'
const type = 'type'
const username = 'gydam'

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))

  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  AgentStub.findByUsername = sandbox.stub()
  AgentStub.findByUsername.withArgs(username).returns(Promise.resolve(agentFixtures.username))

  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.withArgs(uuid).returns(Promise.resolve(metricFixtures.byUuid(uuid)))

  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.withArgs(type, uuid).returns(Promise.resolve(metricFixtures.byType(type, uuid)))

  token = sign({ admin: true, username }, config.auth.secret)

  const api = proxyquire('../api', {
    'gydam-db': dbStub
  })

  server = proxyquire('../server', {
    './api': api
  })
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test.serial.cb('/api/agents', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(agentFixtures.connected)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agents/:uuid', t => {
  request(server)
    .get('/api/agents/' + uuid)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(agentFixtures.byUuid(uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agents/:uuid - not found', t => {
  request(server)
    .get('/api/agents/aaa-aaa-aaa')
    .set('Authorization', `Bearer ${token}`)
    .expect(400)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.truthy(err, 'should return an error')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid', t => {
  request(server)
    .get('/api/metrics/' + uuid)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(metricFixtures.byUuid(uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid - not found', t => {
  request(server)
    .get('/api/metrics/aaa-aaa-aaa')
    .set('Authorization', `Bearer ${token}`)
    .expect(400)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.truthy(err, 'should return an error')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid/:type', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(metricFixtures.byType(type, uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid/:type - not found', t => {
  request(server)
    .get('/api/metrics/aaa-aaa-aaa/type')
    .set('Authorization', `Bearer ${token}`)
    .expect(400)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.truthy(err, 'should return an error')
      t.end()
    })
})
