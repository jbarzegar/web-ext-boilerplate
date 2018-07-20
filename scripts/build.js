process.env.NODE_ENV = 'production'
process.env.BABEL_ENV = 'production'

const path = require('path')
const { promisify } = require('util')

const webpack = promisify(require('webpack'))

const sleep = require('shleep')

const logger = require('consola')

const config = require('../config/webpack/config.prod')

const prepare = require('./utils/prepare')

const platforms = ['chrome', 'firefox']

const createOutputForPlatform = platforms =>
  platforms.map(platformName => ({
    ...config,
    plugins: [
      ...config.plugins,
      new webpack.ProgressPlugin(
        (percentage, msg, current, active, modulepath) => {
          if (process.stdout.isTTY && percentage < 1) {
            process.stdout.cursorTo(0)
            modulepath = modulepath
              ? ' …' + modulepath.substr(modulepath.length - 30)
              : ''
            current = current ? ' ' + current : ''
            active = active ? ' ' + active : ''
            process.stdout.write(
              (percentage * 100).toFixed(0) +
                '% ' +
                msg +
                current +
                active +
                modulepath +
                ' '
            )
            process.stdout.clearLine(1)
          } else if (percentage === 1) {
            process.stdout.write('\n')
          }
        }
      )
    ],
    output: {
      ...config.output,
      path: path.join(__dirname, `../dist/${platformName}`)
    }
  }))

const runBuild = async target => {
  await prepare(target)

  config.output.path = path.resolve(__dirname, `../dist/${target}`)

  config.plugins = [
    ...config.plugins,
    new webpack.ProgressPlugin(
      (percentage, msg, current, active, modulepath) => {
        if (process.stdout.isTTY && percentage < 1) {
          process.stdout.cursorTo(0)
          modulepath = modulepath
            ? ' …' + modulepath.substr(modulepath.length - 30)
            : ''
          current = current ? ' ' + current : ''
          active = active ? ' ' + active : ''
          process.stdout.write(
            (percentage * 100).toFixed(0) +
              '% ' +
              msg +
              current +
              active +
              modulepath +
              ' '
          )
          process.stdout.clearLine(1)
        } else if (percentage === 1) {
          process.stdout.write('\n')
        }
      }
    )
  ]

  return webpack(config)
}

runBuild('chrome')
  .then(() => sleep(10000))
  .then(() => runBuild('firefox'))
