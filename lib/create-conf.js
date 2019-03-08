const yaml = require('yaml')
const prompts = require('prompts')
const path = require('path')
const fs = require('fs')
const logger = require('./logger')
const userHome = require('user-home')

const CONF_PATH = path.join(userHome, '.sendrc')

module.exports = function createConf (defaultValue) {
  const questions = [
    { type: 'text', name: 'S3_ACCESS_ID', message: 'S3 access id?' },
    { type: 'text', name: 'S3_ACCESS_SECRET', message: 'S3 access secret?' },
    { type: 'text', name: 'S3_BUCKET_NAME', message: 'S3 bucket?' },
    { type: 'text', name: 'S3_REGION', message: 'S3 region ? (etc: cn-north-1).' },
    { type: 'text', name: 'S3_PATH', message: 'S3 target path?' }
  ]

  if (defaultValue) {
    questions.forEach(item => {
      item.initial = defaultValue[item.name]
    })
  }

  prompts(questions).then(result => {
    if (Object.keys(result).length === 5) {
      const CONFIG = yaml.stringify(result)
      fs.writeFileSync(CONF_PATH, CONFIG)
      logger.succ('Config complete. enjoy it!')
    } else {
      logger.info('Config option cancelled!')
    }
  })
}
