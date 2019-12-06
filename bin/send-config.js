#!/usr/bin/env node

const program = require('commander')
const yaml = require('yaml')
const logger = require('../lib/logger')
const {
  config
} = require('../lib/config')

let confObj = config()

program
  // .usage('-e <key> [value]')
  // .option('-e, --edit', 'create or edit s3 config')
  // .option('-s, --show', 'checkout s3 config')
  .parse(process.argv)

if (Object.keys(confObj).length) {
  logger.info('Send config:\n')
  console.log(yaml.stringify(confObj))
} else {
  logger.info('config is empty!')
}
