const ext = require('ext-name')
const uid = require('uid')
const ora = require('ora')
const got = require('got')
const execa = require('execa')
const chalk = require('chalk')
const clipboardy = require('clipboardy')
const awsUpload = require('./upload-aws')
const imagurUpload = require('./upload-imagur')
const logger = require('./logger')
const { resolve, parse, join } = require('path')
const { readFileSync } = require('fs')
const { execSync } = require('child_process')

class Send {
  constructor (config) {
    this.config = config
    const {
      storePath,
      filePath,
      fromClipboard
    } = config
    // 处理路径
    if ((storePath || '').substr(-1) !== '/') {
      this.config.storePath += '/'
    }

    switch (true) {
      case (filePath || '').substr(0, 4) === 'http':
        this.byHttpImage()
        break

      case fromClipboard:
        this.byClipImage()
        break

      default:
        this.byFileImage()
        break
    }
  }

  /**
   * 保存图片到s3
   * @param {String} name 图片保存路径及名称
   * @param {Blob} content 图片文件资源
   */
  async upload (name, content) {
    const spinner = ora(`${logger.prefix} Uploading file`)
    spinner.start()

    try {
      let res
      if (this.config.imagur) {
        res = await imagurUpload(content)
      } else {
        res = await awsUpload(name, content)
      }
      clipboardy.writeSync(res.link)
      spinner.succeed(`${logger.prefix} Upload complete!`)
      logger.succ(`File link: ${res.link}`)
      logger.succ(chalk.bold('Image URL had copyed, use CMD + C to paste.'))
    } catch (err) {
      spinner.fail(`${logger.prefix} Upload failed!${err}`, err.stack)
    }
  }

  /**
   * get link from web image
   */
  async byHttpImage () {
    try {
      const {
        storePath,
        filePath,
        aliasName,
        addHash
      } = this.config
      // 获取图片
      const res = await got(filePath, { encoding: null })
      const fileType = ext.mime(res.headers['content-type'])[0] || {}
      const filename = aliasName
        ? aliasName + (addHash ? `-${uid()}` : '') + `.${fileType.ext}`
        : `ni-${uid()}.` + fileType.ext
      await this.upload(`${storePath}${filename}`, Buffer.from(res.body))
    } catch (err) {
      logger.fail('Send file failed!', err.message)
    }
  }

  /**
   * get link from clipboard
   */
  async byClipImage () {
    const {
      storePath,
      aliasName,
      addHash
    } = this.config

    try {
      // 保存剪贴板图片
      const scriptPath = join(__dirname, '../script/clipboard.py')
      const command = [
        'python3 ' + scriptPath,
        `--name=${aliasName || uid()}`
      ]
      const tempFilePath = execSync(command.join(' ')).toString()

      if (tempFilePath === 'error') {
        throw new Error('clipboard has no image')
      }

      const fileInfo = parse(tempFilePath)
      const filename = aliasName
        ? aliasName + (addHash ? `-${uid()}` : '') + fileInfo.ext
        : `ci-${uid()}` + fileInfo.ext

      const fileContent = readFileSync(tempFilePath)
      await this.upload(storePath + filename, fileContent)
    } catch (err) {
      logger.fail(err.message)
    }
  }

  /**
   * get link from file
   */
  async byFileImage () {
    try {
      const {
        storePath,
        filePath,
        aliasName,
        addHash
      } = this.config
      logger.debug(this.config)
      const { name, ext } = parse(filePath)

      /** Contruct file name store in S3 */
      const filename = (aliasName || name) + (addHash ? `-${uid()}` : '') + ext
      /** File tobe send */
      let fileContent
      /** Handle file path in different condition */
      if (filePath[0] === '~' || filePath[0] === '/') {
        fileContent = readFileSync(filePath)
      } else {
        fileContent = readFileSync(resolve(process.cwd(), filePath))
      }
      logger.debug(filename)

      /** upload file */
      await this.upload(storePath + filename, fileContent)
    } catch (err) {
      logger.fail(err.message)
    }
  }

  /**
   * Config execa shell method
   * @param cmd shell command string
   * @param stdio stdio setting of execSync options
   */
  exec (cmd, stdio = 'ignore') {
    return execa.shell(cmd, { stdio })
  }
}

module.exports = Send
