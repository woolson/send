const yaml = require('yaml')
const userHome = require('user-home')
const { existsSync, readFileSync } = require('fs')
const path = require('path')

const CONF_PATH = path.join(userHome, '.sendrc')
const CONFIG = {}

if (existsSync(CONF_PATH)) {
  const config = yaml.parse(readFileSync(CONF_PATH, 'utf-8'))
  Object.assign(CONFIG, config)
}

module.exports = CONFIG
