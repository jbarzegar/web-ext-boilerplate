process.env.NODE_ENV = 'development'
process.env.BABEL_ENV = 'development'

const webpack = require('webpack')
const path = require('path')
const serve = require('webpack-serve')
const logger = require('consola')
const exec = require('child_process').exec

const prepare = require('./utils/prepare')

const config = require('../config/webpack/config.dev')

const extPath = path.resolve(__dirname, '../build')
const chromeExecPath =
  '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome'

const chromeDirPath = path.resolve(__dirname, '../', 'chrome_user_data')

let firstCompile = true

const compiler = webpack(config)

prepare()
  .then(() =>
    serve(
      {},
      {
        compiler,
        ...config.devServer
      }
    )
  )
  .then(res => {
    res.on('build-finished', () => {
      console.clear()
      console.log(firstCompile)
      if (!firstCompile) {
        return
      }
      firstCompile = false
      logger.info('Opening chrome')
      exec(
        `${chromeExecPath} --remote-debugging-port=9222 --load-extension=${extPath} --user-data-dir=${chromeDirPath}`,
        err => {
          if (err) throw err
        }
      )
    })
  })
