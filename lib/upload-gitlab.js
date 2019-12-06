const FormData = require('form-data')
// const got = require('got')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const logger = require('./logger')
const { getConfig } = require('./config')
const { extract } = require('./gitlab/helper')
const { getToken, GITLAB_URL } = require('./gitlab/index')

module.exports = async function (name, file) {
  /** Get session if session invalid */
  // if (!session || !subject) await getToken()
  await getToken()

  let {
    GITLAB_COOKIE_SESSION: session,
    GITLAB_COOKIE_SUBJECT: subject
  } = getConfig()

  const sessionStr = `_gitlab_session=${session}; experimentation_subject_id=${subject}`

  const { attr } = await extract(
    GITLAB_URL.uploadPage,
    {
      headers: { Cookie: sessionStr }
    },
    (name, attr) => {
      return name === 'meta' && attr && attr.name === 'csrf-token'
    })

  const reqBody = new FormData()
  file = fs.createReadStream(path.join(__dirname, '../test.png'))
  reqBody.append('file', file, { filename: name })

  console.log('\n')
  logger.debug('[Session]', sessionStr)
  logger.debug('[Token]', attr.content)
  // logger.debug('[URL]', GITLAB_URL.upload)

  const res = await axios.default({
    url: GITLAB_URL.upload,
    method: 'POST',
    headers: reqBody.getHeaders({
      'Cookie': sessionStr,
      'X-CSRF-Token': attr.content
    }),
    data: reqBody
  })

  return {
    link: `${GITLAB_URL}${JSON.parse(res.body).link.url}`
  }
}
