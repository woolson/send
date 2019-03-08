#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const yaml = require('yaml')
const userHome = require('user-home')
const logger = require('../lib/logger')
const {
  readFileSync,
  existsSync,
  writeFileSync
} = require('fs')
const createConf = require('../lib/create-conf')

const CONF_PATH = path.join(userHome, '.sendrc')
let confStr = ''
let confObj = {}

if (existsSync(CONF_PATH)) {
  confStr = readFileSync(CONF_PATH, 'utf-8')
  confObj = yaml.parse(confStr)
}

program
  .usage('-e <key> [value]')
  .option('-e, --edit', 'create or edit s3 config')
  .option('-s, --show', 'checkout s3 config')
  .parse(process.argv)

if (program.edit) {
  const args = program.args || []
  if (args.length) {
    confObj[args[0]] = args[1]
    writeFileSync(CONF_PATH, yaml.stringify(confObj))
    logger.succ(`add config ${args[0]}:${args[1]} complete!`)
  } else {
    createConf(confObj)
  }
} else if (program.show) {
  if (confStr) {
    logger.info('exists config:\n')
    console.log(confStr)
  } else {
    logger.info('config is empty!')
  }
}
