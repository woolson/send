#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const logger = require('../lib/logger')
const CONFIG = require('../lib/aws-config')
const sendFile = require('../lib/send-file')
const createConf = require('../lib/create-conf')

program
  .version(require('../package').version)
  .usage(`<file|file-link> [options], ${chalk.bold('Run command config before send file!')}`)
  .option('--hash', 'add hash at end of filename')
  .option('-p, --path <path>', 'specific file storage path, default: it-platform')
  .option('-c, --clipboard', 'get image file from clip board')
  .option('-n, --filename <name>', 'name the store file name')
  .parse(process.argv)

if (program.args[0] !== 'config') {
  if (!Object.keys(CONFIG).length) {
    logger.info('No config be found, start config!')
    createConf()
  } else {
    sendFile()
  }
}
