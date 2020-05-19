const uid = require('uid')
const axios = require('axios')
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
const { spinner } = require('./helper')
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
    try {
      spinner.text = 'Initialing...'
      const { storePath } = this.config
      let res
      if (this.config.imgur) {
        res = await imgurUpload(content)
      } else if (this.config.gitlab) {
        res = await gitlabUpload(name, content)
      } else {
        res = await awsUpload(storePath + name, content)
      }
      clipboardy.writeSync(res.link)
      spinner.succeed(`${logger.prefix} Upload complete!`)
      logger.succ(`Image link: ${res.link}`)
      logger.succ(chalk.bold('Image URL had copyed, use CMD + C to paste.'))
    } catch (err) {
      spinner.fail(`${logger.prefix} Upload failed! ${chalk.bold(err)}`)
    }
  }

  /**
   * get link from web image
   */
  async byHttpImage () {
    try {
      spinner.text = 'Downloading web image'
      spinner.start()
      const { filePath } = this.config
      /** Get web image */
      const res = await axios.default({
        url: filePath,
        responseType: 'arraybuffer'
      })
      if (!res.headers['content-type'].includes('image/')) {
        throw new Error('This is not a image link.')
      }
      const fileName = this.getFileName('', res.headers['content-type'].replace('image/', '.'))
      await this.upload(fileName, Buffer.from(res.data))
    } catch (err) {
      spinner.fail(`Upload failed! ${err.message}`)
    }
  }

  /**
   * get link from clipboard
   */
  async byClipImage () {
    try {
      spinner.text = 'Reading clipboard image'
      spinner.start()
      /** Electron clipboard */
      const clipboard = await createClipboard()
      const fileContent = await clipboard.readImage()
      clipboard.close()

      if (!fileContent.length) {
        spinner.stop()
        throw new Error(chalk.bold('Clipboard has no image.'))
      }

      const fileName = this.getFileName('', '.png')

      await this.upload(fileName, fileContent)
    } catch (err) {
      logger.fail('Upload failed!', err.message)
    }
  }

  /**
   * get link from file
   */
  async byFileImage () {
    try {
      spinner.text = 'Reading image file'
      spinner.start()
      const { filePath } = this.config

      /** Contruct file name store in S3 */
      const fileInfo = parse(filePath)
      const fileName = this.getFileName(fileInfo.name, fileInfo.ext)
      /** File tobe send */
      let fileContent
      /** Handle file path in different condition */
      if (filePath[0] === '~' || filePath[0] === '/') {
        fileContent = readFileSync(filePath)
      } else {
        fileContent = readFileSync(resolve(process.cwd(), filePath))
      }

      /** upload file */
      await this.upload(fileName, fileContent)
    } catch (err) {
      spinner.fail(`Upload failed! ${err.message}`)
    }
  }

  /** Get file name */
  getFileName (name, ext) {
    const {
      aliasName,
      addHash,
      fromClipboard
    } = this.config

    if (addHash || fromClipboard || !name) {
      return uid() + ext
    } else if (aliasName) {
      return aliasName + ext
    } else {
      return name + ext
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
