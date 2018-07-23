const WritePlugin = require('write-file-webpack-plugin')

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
    devWindow: [paths.devWindowHelpers]
  },
  plugins: [
    ...config.plugins,
    createHtmlTemplates([
      {
        name: 'background',
        additionalChunks: includeRuntimeChunk('devListener')
      },
      'popup',
      { name: 'devWindow', additionalChunks: ['popup'] }
    ]),
    /* Needed in order to hot reload the web extension */
    new WritePlugin()
  ],
  devServer: {
    port,
    content: paths.buildDir,
    clipboard: false
  }
}
