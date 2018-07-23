process.env.NODE_ENV = 'development'
process.env.BABEL_ENV = 'development'

const path = require('path')
const { exec } = require('child_process')

const remoteDevServer = require('remotedev-server')

const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const clearConsole = require('react-dev-utils/clearConsole')
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware')

const logger = require('consola')
const chalk = require('chalk')

const prepare = require('./utils/prepare')

const config = require('../config/webpack/config.dev')

const extPath = path.resolve(__dirname, '../build')
const chromeExecPath =
  '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome'

const chromeDirPath = path.resolve(__dirname, '../', 'chrome_user_data')

let firstCompile = true

const compiler = webpack(config)

/* Waits until webpack compile finishes */
compiler.hooks.done.tap({ name: 'Initial compile startup' }, () => {
  if (firstCompile) {
    firstCompile = false
    logger.info('Opening chrome')
    exec(
      `${chromeExecPath} --load-extension=${extPath} --user-data-dir=${chromeDirPath}`,
      err => {
        if (err) throw err
      }
    )
  }
})

const init = async () => {
  await prepare()

  const server = new WebpackDevServer(compiler, {
    ...config.devServer,
    before(app) {
      app.use(errorOverlayMiddleware())
    }
  })

  server.listen(3000, '0.0.0.0', err => {
    if (err) {
      console.log(err)
    }

    if (process.stdout.isTTY) {
      clearConsole()
    }

    logger.info(chalk.blue('Starting development server... \n'))
  })

  const sigs = ['SIGINT', 'SIGTERM']
  sigs.forEach(function(sig) {
    process.on(sig, function() {
      server.close()
      process.exit()
    })
  })
}

init()
