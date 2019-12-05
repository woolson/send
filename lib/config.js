const yaml = require('yaml')
const prompts = require('prompts')
const path = require('path')
const fs = require('fs')
const logger = require('./logger')
const userHome = require('user-home')
const { existsSync, readFileSync } = require('fs')

/**
 * Config file path
 */
exports.CONF_PATH = path.join(userHome, '.sendrc')

/**
 * Get config
 */
exports.config = function () {
  const config = {}
  if (existsSync(exports.CONF_PATH)) {
    const userConfig = yaml.parse(readFileSync(exports.CONF_PATH, 'utf-8'))
    Object.assign(config, userConfig)
  }
  return config
}

/**
 * Create config
 */
exports.createConf = function (defaultValue) {
  const questions = [
    { type: 'text', name: 'S3_ACCESS_ID', message: 'S3 access id?' },
    { type: 'text', name: 'S3_ACCESS_SECRET', message: 'S3 access secret?' },
    { type: 'text', name: 'S3_BUCKET_NAME', message: 'S3 bucket?' },
    { type: 'text', name: 'S3_REGION', message: 'S3 region ? (etc: cn-north-1).' },
    { type: 'text', name: 'S3_PATH', message: 'S3 target path?' },
    { type: 'text', name: 'IMGUR_CLIENT_ID', message: 'Imgur client ID?' }
  ]

  if (defaultValue) {
    questions.forEach(item => {
      item.initial = defaultValue[item.name]
    })
  }

  prompts(questions).then(result => {
    const CONFIG = yaml.stringify(result)
    fs.writeFileSync(exports.CONF_PATH, CONFIG)
    logger.succ('Config complete. enjoy it!')
  })
}

/** Get config */
exports.getConfig = function () {
  const config = {}
  if (existsSync(exports.CONF_PATH)) {
    const userConfig = yaml.parse(readFileSync(exports.CONF_PATH, 'utf-8'))
    Object.assign(config, userConfig)
  }
  return config
}

/**
 * Set config
 * @param { Object } newConfig 新的设置
 */
exports.setConfig = function (newConfig) {
  const config = exports.config()
  Object.assign(config, newConfig)
  fs.writeFileSync(exports.CONF_PATH, yaml.stringify(config))
}
