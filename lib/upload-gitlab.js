const FormData = require('form-data')
const axios = require('axios')
// const logger = require('./logger')
const got = require('got')
const { getConfig, setConfig } = require('./config')
const { extract, spinner } = require('./helper')

/**
 * 1. get https://gitlab.com/users/sign_in
 * 2. get _gitlab_session & csrf-token
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
  /** Image Base Link */
  uploadImgBase: 'https://gitlab.com/imgrs/npmer-badge',
  /** Upload image API */
  upload: 'https://gitlab.com/imgrs/pic/uploads',
  /** Upload page */
  uploadPage: 'https://gitlab.com/imgrs/pic/issues/new'
}

module.exports = async function (name, file) {
  /** Get session if session invalid */
  // if (!session || !subject) await getToken()
  const isLogin = await exports.touchLogin()
  console.log('[isLogin]', isLogin)

  if (!isLogin) {
    spinner.text = 'Doing login gitlab'
    await exports.getToken()
    spinner.text = 'Uploading image'
  }

  let {
    GITLAB_COOKIE_SESSION: session,
    GITLAB_COOKIE_SUBJECT: subject
  } = getConfig()

  const sessionStr = `_gitlab_session=${session}; experimentation_subject_id=${subject}`

  const { attr } = await extract(
    exports.GITLAB_URL.uploadPage,
    {
      headers: { Cookie: sessionStr }
    },
    (name, attr) => {
      return name === 'meta' && attr && attr.name === 'csrf-token'
    })

  const reqBody = new FormData()
  reqBody.append('file', file, { filename: name })

  const res = await axios.default({
    url: exports.GITLAB_URL.upload,
    method: 'POST',
    headers: reqBody.getHeaders({
      'Accept': '*/*',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Cookie': sessionStr,
      'X-CSRF-Token': attr.content
    }),
    data: reqBody,
    responseType: 'json'
  })

  return {
    link: `${exports.GITLAB_URL.uploadImgBase}${res.data.link.url}`
  }
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
    const loginRes = await got.post(exports.GITLAB_URL.signIn, {
      body: reqBody,
      headers: reqBody.getHeaders({
        'Cookie': headers['set-cookie'].map(item => item.split('; ')[0]).join(';')
      })
    })
    console.log(loginRes.headers)
  } catch (err) {
    if (err.statusCode !== 302) {
      throw new Error('GitLab Login failed!')
    }

    /** Get login session */
    setConfig({
      GITLAB_COOKIE_SESSION: err.headers['set-cookie'][0].match(/(\d|\w){32}/g)[0],
      GITLAB_COOKIE_SUBJECT: headers['set-cookie'][0].match(/(\w|\d|%|-){96}/g)[0]
    })
  }
}

/**
 * Test login valide
 */
exports.touchLogin = async function () {
  try {
    let {
      GITLAB_COOKIE_SESSION: session,
      GITLAB_COOKIE_SUBJECT: subject
    } = getConfig()
    if (!session || !subject) {
      return false
    }
    const res = await got.get(exports.GITLAB_URL.signIn, {
      headers: {
        Cookie: `_gitlab_session=${session}; experimentation_subject_id=${subject}`
      }
    })
    console.log('Login', res)

    return false
  } catch (err) {
    return true
  }
}
