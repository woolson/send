#!/usr/bin/env node

const program = require('commander')
const logger = require('../lib/logger')
const Send = require('../lib/send')

program
  .version(require('../package').version)
  .option('-c, --clipboard', 'get image file from clipboard')
  .parse(process.argv)

logger.info('Send By [Imagur]')
new Send({ // eslint-disable-line
  filePath: program.args[0],
  fromClipboard: program.clipboard || false,
  imagur: true
})
