const { config } = require('./config')
const FormData = require('form-data')
const got = require('got')
const logger = require('../lib/logger')

const api = 'https://api.imgur.com/3/image'

module.exports = async function saveToImagur (file) {
  const data = new FormData()
  data.append('image', file)

  logger.debug(config())

  let { body } = await got(api, {
    method: 'POST',
    body: data,
    rejectUnauthorized: false,
    headers: {
      Authorization: `Client-ID ${config().IMAGUR_CLIENT_ID}`
    }
  })
  body = JSON.parse(body)
  return body.data
}
