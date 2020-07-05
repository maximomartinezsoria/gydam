'use-strict'

const debug = require('debug')('gydam:db:setup')
const db = require('./')
const inquirer = require('inquirer')
const chalk = require('chalk')

const prompt = inquirer.createPromptModule()

async function setup () {
  const answer = await prompt([
    {
      type: 'confirm',
      name: 'setup',
      message: 'This will destroy your database, are you sure?'
    }
  ])

  if (!answer.setup) return console.log('Nothing happened 🙂')

  const config = {
    database: process.env.DB_NAME || 'gydam',
    username: process.env.DB_USER || 'gydam',
    password: process.env.DB_PASS || 'gydam',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }

  await db(config).catch(handleFatalError)

  console.log('Success')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
