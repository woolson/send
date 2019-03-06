#!/usr/bin/env node

const program = require('commander')
const ext = require('file-extension')
const uid = require('uid')
const ora = require('ora')
const chalk = require('chalk')
const s3 = require('../lib/aws-s3')
const { resolve } = require('path')
const { readFileSync } = require('fs')

program
  .version(require('../package').version)
  .usage('<file> [options]')
  .option('--hash', 'add hash at end of filename')
  .option('-p, --path', 'specific file storage path, default: it-platform/')
  .command('version', 'show command version')
  .parse(process.argv)

let storePath = program.path || 'it-platform/'
const addHash = program.hash || false

let fileName = program.args[0]
let hashName = ''

if (addHash) {
  const fileExt = ext(fileName)
  hashName = fileName.replace(`.${fileExt}`, `-${uid()}.${fileExt}`)
}

if (storePath[storePath.length - 1] !== '/') {
  storePath += '/'
}

const fileContent = readFileSync(resolve(fileName))

const spinner = ora('[Send]: Uploading file ...')
spinner.start()

s3(`${storePath}${addHash ? hashName : fileName}`, fileContent)
  .then(res => {
    spinner.succeed(chalk.bold('[Send]: Upload complete!'))
    console.log(`🔗 ${chalk.bold('[Send]:')} File link:`, res.Location)
  })
  .catch(() => spinner.fail(`${chalk.bold('[Send]:')} Upload failed!`))