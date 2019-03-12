const program = require('commander')
const ext = require('ext-name')
const uid = require('uid')
const ora = require('ora')
const got = require('got')
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
  let fileContent

  // 处理路径
  if (storePath[storePath.length - 1] !== '/') {
    storePath += '/'
  }

  // 线上链接
  if (fileName.substr(0, 4) === 'http') {
    got(fileName, { encoding: null })
      .then(res => {
        const fileType = ext.mime(res.headers['content-type'])[0] || {}
        fileName = `net-image.${fileType.ext}`
        send(`${storePath}${fileName}`, Buffer.from(res.body))
      })
      .catch(logger.fail)
  } else {
    fileContent = readFileSync(resolve(fileName))
    if (addHash) {
      const fileType = ext(fileName)[0] || {}
      hashName = fileName.replace(`.${fileType.ext}`, `-${uid()}.${fileType.ext}`)
    }
    send(`${storePath}${addHash ? hashName : fileName}`, fileContent)
  }
}

function send (name, content) {
  const spinner = ora(`${logger.prefix} Uploading file`)
  spinner.start()

  s3(name, content)
    .then(res => {
      spinner.succeed(`${logger.prefix} Upload complete!`)
      logger.succ(`File link: ${res.Location}`)
    })
    .catch(err => spinner.fail(`${logger.prefix} Upload failed!${err}`))
}
