const WritePlugin = require('write-file-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

const { createHtmlTemplates, includeRuntimeChunk } = require('../helpers')

const config = require('./config.base')
const paths = require('../paths')

const port = process.env.PORT || 3000

module.exports = {
  mode: 'development',
  ...config,
  entry: {
    ...config.entry,
    devListener: [paths.devWindowIndexJs],
    devWindow: [
      require.resolve('webpack-serve-overlay'),
      paths.devWindowHelpers
    ]
  },
  plugins: [
    ...config.plugins,
    ...createHtmlTemplates([
      {
        name: 'background',
        additionalChunks: includeRuntimeChunk('devListener')
      },
      'popup',
      { name: 'devWindow', additionalChunks: ['popup'] }
    ]),
    new FriendlyErrorsPlugin(),
    /* Needed in order to hot reload the web extension */
    new WritePlugin()
  ],
  devServer: {
    port,
    contentBase: paths.buildDir,
    compress: true,
    clientLogLevel: 'none',
    overlay: false,
    quiet: true
  }
}
