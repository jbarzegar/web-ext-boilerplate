process.env.NODE_ENV = 'development'
process.env.BABEL_ENV = 'development'

const serve = require('webpack-serve')

const prepare = require('./utils/prepare')

const config = require('../config/webpack/config.dev')

prepare().then(() =>
  serve(
    {},
    {
      config,
      ...config.devServer
    }
  )
)
