#!/usr/bin/env node

const program = require('commander')
const yaml = require('yaml')
const logger = require('../lib/logger')
const {
  writeFileSync
} = require('fs')
const {
  CONF_PATH,
  config,
  createConf
} = require('../lib/config')

let confObj = config()

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
  if (Object.keys(confObj).length) {
    logger.info('Send config:\n')
    console.log(confObj)
  } else {
    logger.info('config is empty!')
  }
}
