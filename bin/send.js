#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const logger = require('../lib/logger')
const CONFIG = require('../lib/config')
const sendFile = require('../lib/send-file')

program
  .version(require('../package').version)
  .usage(`<file|file-link> [options], ${chalk.bold('Run command config before send file!')}`)
  .option('-c, --clipboard', 'get image file from clip board')
  .parse(process.argv)

if (program.args[0] !== 'config') {
  if (!Object.keys(CONFIG).length) {
    logger.info('No config be found, start config!')
  } else {
    sendFile()
  }
}
