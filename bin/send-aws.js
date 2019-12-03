#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const Send = require('../lib/send')
const { config } = require('../lib/config')
const logger = require('../lib/logger')

program
  .version(require('../package').version)
  .usage(`<file|file-link> [options], ${chalk.bold('Run command "send-config" before send!')}`)
  .option('--hash', 'add hash at end of filename')
  .option('-p, --path <path>', 'specific file storage path, default: temp/')
  .option('-c, --clipboard', 'get image file from clip board')
  .option('-n, --filename <name>', 'name the store file name')
  .parse(process.argv)

logger.info('Send By [AWS S3]')
new Send({ // eslint-disable-line
  storePath: program.path || config().S3_PATH || 'temp/',
  filePath: program.args[0],
  addHash: program.hash || false,
  fromClipboard: program.clipboard || false,
  aliasName: program.filename
})
