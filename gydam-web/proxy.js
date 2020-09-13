'use strict'

const fetch = require('isomorphic-fetch')
const express = require('express')
const { apiToken, endpoint } = require('./config')

const router = express.Router()

const fetcher = async (dataEndpoint) => {
  const response = await fetch(`${endpoint}/api/${dataEndpoint}`, {
    headers: { Authorization: `Bearer ${apiToken}` }
  })
  return await response.json()
}

router.get('/agents', async (req, res, next) => {
  try {
    const data = await fetcher('agents')
    res.send(data)
  } catch (e) {
    next(e)
  }
})

router.get('/agents/:uuid', async (req, res, next) => {
  try {
    const data = await fetcher(`agents/${req.params.uuid}`)
    res.send(data)
  } catch (e) {
    next(e)
  }
})

router.get('/metrics/:uuid', async (req, res, next) => {
  try {
    const data = await fetcher(`metrics/${req.params.uuid}`)
    res.send(data)
  } catch (e) {
    next(e)
  }
})

router.get('/metrics/:uuid/:type', async (req, res, next) => {
  try {
    const data = await fetcher(`metrics/${req.params.uuid}/${req.params.type}`)
    res.send(data)
  } catch (e) {
    next(e)
  }
})

module.exports = router
