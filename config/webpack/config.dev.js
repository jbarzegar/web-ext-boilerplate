const WritePlugin = require('write-file-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const path = require('path')

const config = require('./config.base')

const port = process.env.PORT || 3000

const root = path.resolve(__dirname, '../../')

module.exports = {
  mode: 'development',
  ...config,
  entry: {
    ...config.entry,
    devListener: [require.resolve('./dev-window.js')],
    devWindowHelpers: [path.resolve(root, 'src/dev/dev-window-helpers.js')]
  },
  plugins: [
    ...config.plugins,
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../../public/background.html'),
      filename: 'background.html',
      chunks: [
        'vendors',
        'background',
        'runtime~background',
        'devListener',
        'runtime~devListener'
      ]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../../public/popup.html'),
      filename: 'popup.html',
      chunks: ['vendors', 'popup', 'runtime~popup']
    }),
    /* Needed in order to hot reload the web extension */
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../../public/window.html'),
      filename: 'window.html',
      chunks: [
        'vendors',
        'popup',
        'runtime~popup',
        'devWindowHelpers',
        'runtime~devWindowHelpers'
      ]
    }),
    new WritePlugin()
  ],
  devServer: {
    port,
    content: path.resolve(__dirname, '../build/'),
    clipboard: false
  }
}
