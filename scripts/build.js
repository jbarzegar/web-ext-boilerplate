process.env.NODE_ENV = 'production'
process.env.BABEL_ENV = 'production'

const path = require('path')
const { promisify } = require('util')

const webpack = promisify(require('webpack'))
const HtmlWebpackPlugin = require('html-webpack-plugin')

const sleep = require('shleep')

const logger = require('consola')

const prepare = require('./utils/prepare')

const platforms = ['chrome', 'firefox']

const runBuild = async target => {
  await prepare(target)

  const config = require('../config/webpack/config.prod')

  await sleep(1000)

  return webpack({
    ...config,
    output: {
      ...config.output,
      path: path.resolve(__dirname, `../dist/${target}`)
    },
    plugins: [
      ...config.plugins,
      /* The reason these plugins are not configured in `config.prod` is because there's some  crazy bug that prevents  */
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '../public/background.html'),
        filename: 'background.html',
        chunks: ['background', 'runtime~background', 'vendors']
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '../public/popup.html'),
        filename: 'popup.html',
        chunks: ['popup', 'runtime~popup', 'vendors']
      })
    ]
  })
}

platforms.forEach(runBuild)
