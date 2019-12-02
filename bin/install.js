#!/usr/bin/env node

const fs = require('fs')
const logger = require('../lib/logger')
const { CONF_PATH } = require('../lib/config')

fs.writeFileSync(CONF_PATH, 'IMAGUR_CLIENT_ID: 1dfa83c47f8a089')
logger.info('Config file ~/.sendrc has been created')
