#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const { history, clear } = require('../lib/history')
const logger = require('../lib/logger')
const format = require('date-format')

program
  .option('--clear', 'clear all send history.')
  .option('-i,--index <index>', 'history list start index.')
  .option('-l,--length <length>', 'how many history to be list.')
  .parse(process.argv)

if (program.clear) {
  clear()
} else {
  const index = +program.index || 0
  const length = +program.length || 5

  const list = history(index, length)
  if (list.length) {
    console.log('—'.repeat(41))
    list.forEach(line => {
      const index = chalk.bold(`${line.index}`.padEnd(3))
      const method = line.method.padEnd(8)
      const date = format('yyyy-MM-dd hh:mm:ss', new Date(line.date))
      console.log(`▶ ${index} ${line.source}   ${method} ${chalk.bold.green.underline(date)}`)
      console.log(line.link)
      const length = line.link.length < 41 ? 41 : line.link.length
      console.log('—'.repeat(length))
    })
  } else {
    logger.info('No history.')
  }
}
