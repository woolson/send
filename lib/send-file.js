const program = require('commander')
const ext = require('ext-name')
const uid = require('uid')
const ora = require('ora')
const got = require('got')
const execa = require('execa')
const chalk = require('chalk')
const clipboardy = require('clipboardy')
const { execSync } = require('child_process')
const s3 = require('../lib/aws-s3')
const logger = require('../lib/logger')
const { resolve, parse, join } = require('path')
const { readFileSync } = require('fs')
const CONFIG = require('./aws-config')

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
      // 网络图片
      case (filePath || '').substr(0, 4) === 'http':
        this.byHttpImage()
        break

      // 剪贴板图片
      case fromClipboard:
        this.byClipImage()
        break

      // 本地图片
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
  async sendToS3 (name, content) {
    const spinner = ora(`${logger.prefix} Uploading file`)
    spinner.start()

    try {
      const res = await s3(name, content)
      clipboardy.writeSync(res.Location)
      spinner.succeed(`${logger.prefix} Upload complete!`)
      logger.succ(`File link: ${res.Location}`)
      logger.succ(chalk.bold('Image URL had copyed, use CMD + C to paste.'))
    } catch (err) {
      spinner.fail(`${logger.prefix} Upload failed!${err}`)
    }
  }

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
      await this.sendToS3(`${storePath}${filename}`, Buffer.from(res.body))
    } catch (err) {
      logger.fail('Get file failed!', err.message)
    }
  }

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
      await this.sendToS3(storePath + filename, fileContent)
    } catch (err) {
      logger.fail(err.message)
    }
  }

  async byFileImage () {
    const {
      storePath,
      filePath,
      aliasName,
      addHash
    } = this.config
    const { name, ext } = parse(filePath)
    const filename = (aliasName || name) + (addHash ? `-${uid()}` : '') + ext
    const fileContent = readFileSync(resolve(filename))
    await this.sendToS3(storePath + filename, fileContent)
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

module.exports = function sendFile () {
  const config = {
    storePath: program.path || CONFIG.S3_PATH || 'it-platform/',
    filePath: program.args[0],
    addHash: program.hash || false,
    fromClipboard: program.clipboard || false,
    aliasName: program.filename
  }

  new Send(config) // eslint-disable-line
}
