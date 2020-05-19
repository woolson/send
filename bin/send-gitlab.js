#!/usr/bin/env node

const program = require('commander')
const logger = require('../lib/logger')
const Send = require('../lib/send')
const { createConf, getConfig } = require('../lib/config')

program
  .version(require('../package').version)
  .option('-c, --clipboard', 'get image file from clipboard')
  .option('-e, --edit', 'edit config')
  .parse(process.argv)

if (program.edit) {
  const config = getConfig()
  createConf({
    GITLAB_TOKEN: config.GITLAB_TOKEN
  }, 'gitlab')
} else {
  logger.info('Send By [GitLab]')
  new Send({ // eslint-disable-line
    filePath: program.args[0],
    fromClipboard: program.clipboard || false,
    gitlab: true
  })
}
