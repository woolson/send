const FormData = require('form-data')
const axios = require('axios')
const { getConfig } = require('./config')
const { spinner } = require('./helper')

/** GitLab Links */
exports.GITLAB_URL = {
  /** GitLab index page */
  index: 'https://gitlab.com/',
  /** Login API */
  signIn: 'https://gitlab.com/users/sign_in',
  /** Image Base Link */
  uploadImgBase: 'https://gitlab.com/imgrs/pic',
  /** Upload image API */
  upload: 'https://gitlab.com/api/v4/projects/15714509/uploads',
  /** Upload page */
  uploadPage: 'https://gitlab.com/imgrs/pic/issues/new'
}

module.exports = async function (name, file) {
  /** Get GitLab Token invalid */
  const config = getConfig()

  if (!config.GITLAB_TOKEN) {
    throw new Error(`Please setup GitLab TOKEN with command "send-gl -e".`)
  }
  spinner.text = 'Uploading Image...'

  const reqBody = new FormData()
  reqBody.append('file', file, { filename: name })

  const res = await axios.default({
    url: exports.GITLAB_URL.upload,
    method: 'POST',
    headers: reqBody.getHeaders({
      'Accept': '*/*',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'PRIVATE-TOKEN': config.GITLAB_TOKEN
    }),
    data: reqBody,
    responseType: 'json'
  })

  return {
    link: `${exports.GITLAB_URL.uploadImgBase}${res.data.url}`
  }
}
