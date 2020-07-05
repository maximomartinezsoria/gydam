'use-strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const metricFixtures = require('./fixtures/metric')
const agentFixtures = require('./fixtures/agent')

const uuid = 'yyy-yyy-yyy'
const type = 'type'
let sandbox = null
let db = null
const config = {
  logging: function () {}
}

let MetricStub = null
const AgentStub = {
  hasMany: sinon.spy()
}

const uuidArgs = {
  attributes: ['type'],
  group: ['type'],
  include: [{
    attributes: [],
    model: AgentStub,
    where: { uuid }
  }],
  raw: true
}

const typeArgs = {
  attributes: ['id', 'type', 'value', 'createdAt'],
  where: {
    type
  },
  limit: 20,
  order: [['createdAt', 'DESC']],
  include: [{
    attributes: [],
    model: AgentStub,
    where: { uuid }
  }],
  raw: true
}

const whereUuid = { where: { uuid } }

const newMetric = {
  type: 'new-type',
  value: 'new-value'
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  MetricStub = {
    belongsTo: sandbox.spy()
  }

  // Agent findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(whereUuid).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model findByAgentUuid Stub
  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.withArgs(uuid).returns(Promise.resolve(metricFixtures.byUuid(uuid)))

  // Model findByTypeAgentUuid Stub
  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.withArgs(type, uuid).returns(Promise.resolve(metricFixtures.byType(type, uuid)))

  // Model findAll Stub
  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs(uuidArgs).returns(Promise.resolve(metricFixtures.byUuid(uuid)))
  MetricStub.findAll.withArgs(typeArgs).returns(Promise.resolve(metricFixtures.byType(type, uuid)))

  // Model create Stub
  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(uuid, newMetric).returns(Promise.resolve(newMetric))
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve(newMetric))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(_ => {
  sandbox && sandbox.restore()
})

test.serial('Metric#findByAgentUuid', async t => {
  const metrics = await db.Metric.findByAgentUuid(uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(uuidArgs), 'findAll should be called with uuidArgs')

  t.is(metrics.length, metricFixtures.byUuid(uuid).length, 'Metrics should be the same ammount')
  t.deepEqual(metrics, metricFixtures.byUuid(uuid), 'Metrics should be the same')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  const metrics = await db.Metric.findByTypeAgentUuid(type, uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(typeArgs), 'findAll should be called with typeArgs')

  t.is(metrics.length, metricFixtures.byType(type, uuid).length, 'Metrics should be the same ammount')
  t.deepEqual(metrics, metricFixtures.byType(type, uuid), 'Metrics should be the same')
})

test.serial('Metric#create', async t => {
  const metric = await db.Metric.create(uuid, newMetric)

  t.true(AgentStub.findOne.called, 'findOne should be called on Agent model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(whereUuid), 'findOne should be called with whereUuid args')

  t.true(MetricStub.create.called, 'create should be called on model')
  t.true(MetricStub.create.calledOnce, 'create should be called once')
  t.true(MetricStub.create.calledWith(newMetric), 'create should be called with newMetric')

  t.deepEqual(metric, newMetric, 'Metrics should be the same')
})
