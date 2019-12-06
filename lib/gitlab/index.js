const got = require('got')
const FormData = require('form-data')
const logger = require('../logger')
const { getConfig, setConfig } = require('../config')
const { extract } = require('./helper')

/**
 * 1. get https://gitlab.com/users/sign_in
 * 2. 拿到 _gitlab_session 和 csrf-token
 * 3. post https://gitlab.com/users/sign_in
 * utf8: ✓
 * authenticity_token: xdFNLW3GXjP0h2GHniH8j0aDHCoV+7CfPb/Vy39Irm3FpJd26UvGuhTx/CrtlP3uQsR5HTFSOEQl1+7uYUxCvg==
 * user[login]: woolson
 * user[password]: 3J3Urthv5E9hLiX
 * user[remember_me]: 0
 */

/** GitLab Links */
exports.GITLAB_URL = {
  /** GitLab index page */
  index: 'https://gitlab.com/',
  /** Login API */
  signIn: 'https://gitlab.com/users/sign_in',
  /** Upload image API */
  upload: 'https://gitlab.com/woolson/npmer-badge/uploads',
  /** Upload page */
  uploadPage: 'https://gitlab.com/woolson/npmer-badge/issues/new'
}

/**
 * Get gitlab login token
 */
exports.getToken = async function () {
  /** 获取登录页面Token属性 */
  const {
    attr,
    headers
  } = await extract(exports.GITLAB_URL.signIn, {}, (name, attr) => {
    return name === 'meta' && attr && attr.name === 'csrf-token'
  })

  /** send config */
  const config = getConfig()

  if (!config.GITLAB_USER_NAME || !config.GITLAB_USER_PASS) {
    throw new Error('Please setup GitLab username & password.')
  }

  const reqBody = new FormData()
  reqBody.append('utf8', '✓')
  reqBody.append('authenticity_token', attr.content)
  reqBody.append('user[login]', config.GITLAB_USER_NAME)
  reqBody.append('user[password]', config.GITLAB_USER_PASS)
  reqBody.append('user[remember_me]', '0')

  try {
    /** User login */
    await got.post(exports.GITLAB_URL.signIn, {
      body: reqBody,
      headers: {
        Cookie: headers['set-cookie']
      }
    })
  } catch (err) {
    if (err.statusCode !== 302) {
      logger.fail('GitLab Login failed!')
      return
    }
    /** Get login session */
    setConfig({
      GITLAB_COOKIE_SESSION: err.headers['set-cookie'][0].match(/(\d|\w){32}/g)[0],
      GITLAB_COOKIE_SUBJECT: headers['set-cookie'][0].match(/(\w|\d|%|-){96}/g)[0]
    })
  }
}
