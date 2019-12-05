const FormData = require('form-data')
const got = require('got')
const fs = require('fs')
const path = require('path')
// const logger = require('./logger')
const { getConfig } = require('./config')
const { extract } = require('./gitlab/helper')
const { getToken, GITLAB_URL } = require('./gitlab/index')

module.exports = async function (name, file) {
  let {
    GITLAB_COOKIE_SESSION: session,
    GITLAB_COOKIE_SUBJECT: subject
  } = getConfig()
  /** Get session if session invalid */
  if (!session || !subject) await getToken()

  const sessionStr = `_gitlab_session=${session}; experimentation_subject_id=${subject}`

  const { attr } = await extract(
    GITLAB_URL.uploadPage,
    {
      headers: { Cookie: sessionStr }
    },
    (name, attr) => {
      return name === 'meta' && attr && attr.name === 'csrf-token'
    })

  const reqBody = new FormData({ readable: true })
  reqBody.append('file', fs.readFileSync(path.join(__dirname, '../test.png'), { flag: 'r' }), { filename: name })

  const res = await got(GITLAB_URL.upload, {
    method: 'POST',
    body: reqBody,
    headers: {
      Cookie: session,
      'X-CSRF-Token': attr.content
    }
  })

  return {
    link: `${GITLAB_URL}${JSON.parse(res.body).link.url}`
  }
}
