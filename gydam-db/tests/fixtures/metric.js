'use-strict'

const metric = {
  type: 'type',
  value: 'value',
  agentUuid: 'yyy-yyy-yyy'
}

const metrics = [
  metric,
  { type: 'type2', value: 'value2' },
  { type: 'type3', value: 'value3' },
  { type: 'type4', value: 'value4' }
]

module.exports = {
  metric,
  byUuid: uuid => metrics.filter(metric => metric.agentUuid === uuid),
  byType (type, uuid) {
    return this.byUuid(uuid).filter(metric => metric.type === type)
  }
}
