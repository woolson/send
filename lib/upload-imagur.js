const { config } = require('./config')
const FormData = require('form-data')
const got = require('got')
const chalk = require('chalk')

const api = 'https://api.imgur.com/3/image'

module.exports = async function saveToImagur (file) {
  const data = new FormData()
  data.append('image', file)

  const clientId = config().IMAGUR_CLIENT_ID

  if (!clientId) {
    throw new Error(`Imagur clientId could not be null.\n  ${chalk.bold.yellow('Please add line "IMAGUR_CLIENT_ID: <clientId>" in .sendrc file')}.\n  You can use 1dfa83c47f8a089 if you haven't your own.
    `)
  }

  let { body } = await got(api, {
    method: 'POST',
    body: data,
    rejectUnauthorized: false,
    headers: {
      Authorization: `Client-ID ${clientId}`
    }
  })
  body = JSON.parse(body)
  return body.data
}
