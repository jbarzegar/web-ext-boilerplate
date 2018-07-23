const fs = require('fs-extra')
const path = require('path')

const appDir = fs.realpathSync(process.cwd())

const resolvePath = relativePath => path.resolve(appDir, relativePath)

module.exports = {
  nodeModules: resolvePath('node_modules'),

  env: resolvePath('.env'),
  root: resolvePath('.'),
  srcDir: resolvePath('src'),
  buildDir: resolvePath('build'),
  distDir: resolvePath('dist'),
  publicDir: resolvePath('public'),
  configDir: resolvePath('config'),

  popupIndexJs: resolvePath('src/common/popup.js'),
  popupIndexHtml: resolvePath('public/popup.html'),

  backgroundIndexJs: resolvePath('src/common/background.js'),
  backgroundIndexHtml: resolvePath('public/background.html'),

  devWindowIndexJs: resolvePath('config/dev-window.js'),
  devWindowHelpers: resolvePath('src/dev/dev-window-helpers.js'),
  devWindowHtml: resolvePath('public/window.html')
}
