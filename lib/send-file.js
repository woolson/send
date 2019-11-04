const program = require('commander')
const ext = require('ext-name')
const uid = require('uid')
const ora = require('ora')
const got = require('got')
const execa = require('execa')
const chalk = require('chalk')
const clipboardy = require('clipboardy')
const { execSync } = require('child_process')
const upload = require('../lib/upload')
const logger = require('../lib/logger')
const { parse, join } = require('path')
const { readFileSync } = require('fs')

class Send {
  constructor (config) {
    this.config = config
    const {
      filePath,
      fromClipboard
    } = config

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
      const res = await upload(name, content)
      clipboardy.writeSync(res)
      spinner.succeed(`${logger.prefix} Upload complete!`)
      logger.succ(`File link: ${res}`)
      logger.succ(chalk.bold('Image URL had copyed, use CMD + C to paste.'))
    } catch (err) {
      spinner.fail(`${logger.prefix} Upload failed! ${err}`)
      err.stack && console.log(err.stack)
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
    const { filePath } = this.config
    const { name, ext } = parse(filePath)
    if ('.png,.jpg,.jpeg,.gif,.bmp,.webp'.includes(ext)) {
      const fileContent = readFileSync(join(__dirname, '..', filePath))
      await this.sendToS3(name + ext, fileContent)
    } else {
      logger.fail('Please choose image to upload!')
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

module.exports = function sendFile () {
  const config = {
    filePath: program.args[0],
    fromClipboard: program.clipboard || false
  }

  new Send(config) // eslint-disable-line
}
