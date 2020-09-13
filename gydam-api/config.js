'use strict'

const debug = require('debug')

module.exports = {
  db: {
    database: process.env.DB_NAME || 'gydam',
    username: process.env.DB_USER || 'gydam',
    password: process.env.DB_PASS || 'gydam',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s)
  },

  auth: {
    secret: process.env.SECRET || 'gydam',
    algorithms: ['HS256']
  }
}
