const chalk = require('chalk')

module.exports = {
  prefix: chalk.bold('[Send]:'),
  succ (...param) {
    console.log(`${chalk.green('✔︎')} ${this.prefix}`, ...param)
  },
  fail (...param) {
    console.log(`${chalk.red('✖︎')} ${this.prefix}`, ...param)
  },
  info (...param) {
    console.log(`${chalk.cyan('❝')} ${this.prefix}`, ...param)
  },
  debug (...param) {
    console.log(`🐞 ${this.prefix}`, ...param)
  }
}
