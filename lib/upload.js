const CONFIG = require('./config')
const FormData = require('form-data')
const got = require('got')

const api = 'https://api.imgur.com/3/image'

module.exports = async function saveToImagur (name, file) {
  const data = new FormData()
  data.append('image', file)
  let { body } = await got(api, {
    method: 'POST',
    body: data,
    rejectUnauthorized: false,
    headers: {
      Authorization: `Client-ID ${CONFIG.IMAGUR_CLIENT_ID}`
    }
  })
  body = JSON.parse(body)
  return body.data.link
}
