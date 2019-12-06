#!/usr/bin/env node

const program = require('commander')
const logger = require('../lib/logger')
const Send = require('../lib/send')
const { createConf, getConfig } = require('../lib/logger')

program
  .version(require('../package').version)
  .option('-c, --clipboard', 'get image file from clipboard')
  .option('-e, --edit', 'edit config')
  .parse(process.argv)

if (program.edit) {
  const config = getConfig()
  createConf({
    IMGUR_CLIENT_ID: config.IMGUR_CLIENT_ID
  }, 'imgur')
} else {
  logger.info('Send By [Imgur]')
  new Send({ // eslint-disable-line
    filePath: program.args[0],
    fromClipboard: program.clipboard || false,
    imgur: true
  })
}
