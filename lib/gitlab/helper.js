const got = require('got')

exports.extract = function (reqUrl, reqOptions = {}, filter) {
  const htmlparser2 = require('htmlparser2')

  return new Promise(async (resolve) => {
    /** 请求登录页面 */
    const {
      body: loginContent,
      headers
    } = await got(reqUrl, reqOptions)
    const parser = new htmlparser2.Parser({
      onopentag (name, attr) {
        if (filter(name, attr)) resolve({ attr, headers })
      }
    }, { decodeEntities: true })
    parser.write(loginContent)
    parser.end()
  })
}
