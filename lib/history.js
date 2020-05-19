const path = require('path')
const fs = require('fs')
const userHome = require('user-home')
const prompts = require('prompts')
const logger = require('./logger')

/** 历史记录存储位置 */
exports.HISTORY_PATH = path.join(userHome, '.send-history')

/**
 * 插入记录
 * @param {object} data 记录数据
 */
exports.insert = function (data) {
  const content = exports.history()
  content.unshift(Object.assign(data, {
    index: content.length
  }))
  fs.writeFileSync(exports.HISTORY_PATH, JSON.stringify(content))
}

/**
 * 获取历史记录
 * @param {number} startIndex 历史记录开始位置
 * @param {number} length     获取多少条
 */
exports.history = function (startIndex = 0, length = 10) {
  let content = []
  if (fs.existsSync(exports.HISTORY_PATH)) {
    content = JSON.parse(fs.readFileSync(exports.HISTORY_PATH))
  }
  if (isNaN(startIndex)) {
    startIndex = 0
  }
  if (isNaN(length)) {
    startIndex = 10
  }
  content = content.slice(startIndex, length ? startIndex + length : void 0)
  return content
}

exports.clear = function () {
  prompts({
    message: 'Confirm to clear all history?',
    type: 'confirm',
    name: 'value'
  })
    .then((res) => {
      if (res.value) {
        fs.writeFileSync(exports.HISTORY_PATH, '[]')
      }
      logger.succ('All history is empty.')
    })
}
