const webpack = require('webpack')
const path = require('path')

/* Plugins */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const getClientEnviroment = require('../envs')

const root = path.resolve(__dirname, '../../')
const publicDir = path.resolve(root, 'public')

const base = path.join('src/common/')
const popup = path.join(base, 'popup')

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/'
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = ''
// Get environment variables to inject into our app.

const env = getClientEnviroment(publicUrl)

const alias = {
  Components: path.resolve(popup, 'components'),
  Containers: path.resolve(popup, 'containers'),
  Styles: path.resolve(popup, 'styles'),
  State: path.resolve(base, 'state'),
  Assets: path.resolve(popup, 'assets'),
  Helpers: path.resolve('src/helpers')
}

/* Webpack config entry */
const resolve = {
  extensions: [
    '.web.js',
    '.mjs',
    '.js',
    '.json',
    '.web.jsx',
    '.jsx',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'eot',
    'otf',
    'ttf',
    'woff',
    'woff2'
  ],
  alias: {
    ...alias,
    // Support React Native Web, Might be useful if we migrate to it
    // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
    'react-native': 'react-native-web'
  }
}

const jsRegex = /\.(js|jsx|mjs)$/
const include = [path.resolve(base, 'src')]
const exclude = [/[/\\\\]node_modules[/\\\\]/]

/* Helper function to quickly include thread loader with sane defaults */
const parallelizeLoader = () => ({
  loader: require.resolve('thread-loader'),
  options: {
    poolTimeout: process.env.NODE_ENV === 'development' ? Infinity : 5000 // keep workers alive for more effective watch mode
  }
})

/* Webpack config entry */
const rules = [
  // require.ensure is a nonstandard feature, so it should be disabled
  { parser: { requireEnsure: false } },
  {
    test: jsRegex,
    include: /src/,
    enforce: 'pre',
    use: ['eslint-loader'],
    exclude
  },
  // "oneOf" will traverse all following loaders until one will
  // match the requirements. When no loader matches it will fall
  // back to the "file" loader at the end of the loader list.
  {
    oneOf: [
      // "url" loader works like "file" loader except that it embeds assets
      // smaller than specified limit in bytes as data URLs to avoid requests.
      // A missing `test` is equivalent to a match.
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]'
        }
      },
      // Process application JS with Babel.
      // The preset includes JSX, Flow, and some ESnext features.
      {
        test: /\.(js|jsx|mjs)$/,
        exclude,
        use: [
          // This loader parallelizes code compilation, it is optional but
          // improves compile time on larger projects
          // parallelizeLoader(),
          {
            loader: require.resolve('babel-loader'),
            options: {
              presets: [require.resolve('babel-preset-react-app')],
              plugins: [
                [
                  require.resolve('babel-plugin-named-asset-import'),
                  {
                    loaderMap: {
                      svg: {
                        ReactComponent: 'svgr/webpack![path]'
                      }
                    }
                  }
                ]
              ],
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: false,
              highlightCode: true
            }
          }
        ]
      },
      // Process any JS outside of the app with Babel.
      // Unlike the application JS, we only compile the standard ES features.
      {
        test: /\.js$/,
        use: [
          // This loader parallelizes code compilation, it is optional but
          // improves compile time on larger projects
          // parallelizeLoader(),
          {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: false,
              compact: false,
              presets: [require.resolve('babel-preset-react-app/dependencies')],
              cacheDirectory: true,
              highlightCode: true
            }
          }
        ]
      },
      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      // This loader doesn't use a "test" so it will catch all modules
      // that fall through the other loaders.
      {
        // Exclude `js` files to keep "css" loader working as it injects
        // its runtime that would otherwise be processed through "file" loader.
        // Also exclude `html` and `json` extensions so they get processed
        // by webpacks internal loaders.
        exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
        loader: require.resolve('file-loader'),
        options: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }
    ]
  }
  // ** STOP ** Are you adding a new loader?
  // Make sure to add the new loader(s) before the "file" loader.
]

const createChunkArray = mainChunkName => [
  'vendors',
  `runtime~${mainChunkName}`,
  mainChunkName
]

// const createTemplateConfig = ({ name, chunks = [] }) => {
//   const filename = `${name}.html`

//   return {
//     template: path.resolve(publicDir, filename),
//     filename,
//     chunks: [...createChunkArray(name), ...chunks]
//   }
// }

// const htmlTemplates = [
//   createTemplateConfig({ name: 'popup' }),
//   createTemplateConfig({
//     name: 'background',
//     chunks:
//       process.env.NODE_ENV === 'development'
//         ? ['devListener', 'runtime~devListener']
//         : []
//   })
// ]

const plugins = [
  // ...htmlTemplates.map(
  //   config =>
  //     new HtmlWebpackPlugin({
  //       ...config,
  //       inject: 'body'
  //     })
  // ),

  new webpack.DefinePlugin(env.stringified),

  new CopyWebpackPlugin([
    {
      from: path.resolve(
        __dirname,
        '../../node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
      )
    },
    {
      from: path.resolve(
        __dirname,
        '../../node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map'
      )
    }
  ])
]

const baseEntry = [require.resolve('../polyfills')]
// Config
module.exports = {
  entry: {
    popup: [...baseEntry, path.resolve(root, 'src/common/popup.js')],
    background: [...baseEntry, path.resolve(root, 'src/common/background.js')]
  },
  output: {
    path: path.resolve(root, 'build'),
    filename: 'static/js/[name].bundle.js',
    chunkFilename: 'static/js/[name].chunk.js'
  },
  optimization: {
    // Automatically split vendor and commons
    // https://twitter.com/wSokra/status/969633336732905474
    // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
    splitChunks: {
      chunks: 'all',
      name: 'vendors'
    },
    runtimeChunk: true
  },
  resolve,
  module: {
    strictExportPresence: true,
    rules
  },
  plugins,
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  // Turn off performance processing because we utilize
  // our own hints via the FileSizeReporter
  performance: false
}
