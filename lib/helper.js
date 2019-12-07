const axios = require('axios')
const ora = require('ora')

exports.extract = function (reqUrl, reqOptions = {}, filter) {
  const htmlparser2 = require('htmlparser2')

  return new Promise(async (resolve) => {
    /** 请求登录页面 */
    const {
      data: loginContent,
      headers
    } = await axios.default({
      url: reqUrl,
      ...reqOptions
    })
    const parser = new htmlparser2.Parser({
      onopentag (name, attr) {
        if (filter(name, attr)) resolve({ attr, headers })
      }
    }, { decodeEntities: true })
    parser.write(loginContent)
    parser.end()
  })
}

exports.spinner = ora()
