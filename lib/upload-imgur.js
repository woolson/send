const { config } = require('./config')
const FormData = require('form-data')
const axios = require('axios')
const chalk = require('chalk')

const api = 'https://api.imgur.com/3/image'

module.exports = async function (file) {
  const data = new FormData()
  data.append('image', file)

  const clientId = config().IMGUR_CLIENT_ID

  if (!clientId) {
    throw new Error(`Imgur clientId could not be null.\n  ${chalk.bold.yellow('Please add line "IMGUR_CLIENT_ID: <clientId>" in .sendrc file')}.\n  You can use 1dfa83c47f8a089 if you haven't your own.
    `)
  }

  let { body } = await axios.default({
    url: api,
    method: 'POST',
    body: data,
    rejectUnauthorized: false,
    headers: {
      Authorization: `Client-ID ${clientId}`
    }
  })

  return JSON.parse(body).data
}
