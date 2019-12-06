const ext = require('ext-name')
const uid = require('uid')
const ora = require('ora')
const got = require('got')
const execa = require('execa')
const chalk = require('chalk')
const clipboardy = require('clipboardy')
const awsUpload = require('./upload-aws')
const imgurUpload = require('./upload-imgur')
const gitlabUpload = require('./upload-gitlab')
const logger = require('./logger')
const { resolve, parse } = require('path')
const { readFileSync } = require('fs')
// const { execSync } = require('child_process')
const createClipboard = require('node-electron-clipboard')

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
   * Upload file
   * @param {String} name file name
   * @param {Blob} content file
   */
  async upload (name, content) {
    const spinner = ora(`${logger.prefix} Uploading file`)
    spinner.start()

    try {
      let res
      if (this.config.imgur) {
        res = await imgurUpload(content)
      } else if (this.config.gitlab) {
        res = await gitlabUpload(name, content)
      } else {
        res = await awsUpload(name, content)
      }
      clipboardy.writeSync(res.link)
      spinner.succeed(`${logger.prefix} Upload complete!`)
      logger.succ(`Image link: ${res.link}`)
      logger.succ(chalk.bold('Image URL had copyed, use CMD + C to paste.'))
    } catch (err) {
      console.log(err.headers)

      spinner.fail(`${logger.prefix} Upload failed! ${chalk.bold(err)}`)
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
      /** Get web image */
      const loading = ora(`${logger.prefix} Downloading web image...`)
      loading.start()

      const res = await got(filePath, { encoding: null })
      const fileType = ext.mime(res.headers['content-type'])[0] || {}
      const filename = aliasName
        ? aliasName + (addHash ? `-${uid()}` : '') + `.${fileType.ext}`
        : `ni-${uid()}.` + fileType.ext
      loading.stop()
      await this.upload(`${storePath}${filename}`, Buffer.from(res.body))
    } catch (err) {
      logger.fail('Upload failed!', err.message)
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
      const loading = ora(`${logger.prefix} Reading clipboard image`)
      loading.start()
      const clipboard = await createClipboard()
      const image = await clipboard.readImage()
      clipboard.close()
      loading.stop()

      if (!image.length) {
        throw new Error(chalk.bold('Clipboard has no image.'))
      }

      const filename = aliasName
        ? aliasName + (addHash ? `-${uid()}` : '') + '.png'
        : `ci-${uid()}` + '.png'

      await this.upload(storePath + filename, image)
    } catch (err) {
      logger.fail('Upload failed!', err.message)
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

      /** upload file */
      await this.upload(storePath + filename, fileContent)
    } catch (err) {
      logger.fail('Upload failed!', err.message)
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
