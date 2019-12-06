#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const Send = require('../lib/send')
const logger = require('../lib/logger')
const { createConf, getConfig } = require('../lib/config')

program
  .version(require('../package').version)
  .usage(`<file|file-link> [options], ${chalk.bold('Run command "send-config" before send!')}`)
  .option('--hash', 'add hash at end of filename')
  .option('-p, --path <path>', 'specific file storage path, default: temp/')
  .option('-c, --clipboard', 'get image file from clip board')
  .option('-e, --edit', 'edit config')
  .parse(process.argv)

if (program.edit) {
  const config = getConfig()
  createConf({
    S3_ACCESS_ID: config.S3_ACCESS_ID,
    S3_ACCESS_SECRET: config.S3_ACCESS_SECRET,
    S3_BUCKET_NAME: config.S3_BUCKET_NAME,
    S3_REGION: config.S3_REGION,
    S3_PATH: config.S3_PATH
  }, 'aws')
} else {
  logger.info('Send By [AWS S3]')
  new Send({ // eslint-disable-line
    storePath: program.path || getConfig().S3_PATH || 'temp/',
    filePath: program.args[0],
    addHash: program.hash || false,
    fromClipboard: program.clipboard || false,
    aliasName: program.filename
  })
}
