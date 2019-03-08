const program = require('commander')
const ext = require('file-extension')
const uid = require('uid')
const ora = require('ora')
const s3 = require('../lib/aws-s3')
const logger = require('../lib/logger')
const { resolve } = require('path')
const { readFileSync } = require('fs')
const CONFIG = require('./aws-config')

module.exports = function sendFile () {
  let storePath = program.path || CONFIG.S3_PATH || 'it-platform/'
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

  const spinner = ora(`${logger.prefix} Uploading file`)
  spinner.start()

  s3(`${storePath}${addHash ? hashName : fileName}`, fileContent)
    .then(res => {
      spinner.succeed(`${logger.prefix} Upload complete!`)
      logger.succ(`File link: ${res.Location}`)
    })
    .catch(err => spinner.fail(`${logger.prefix} Upload failed!${err}`))
}
