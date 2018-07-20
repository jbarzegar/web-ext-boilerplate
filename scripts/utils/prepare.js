const path = require('path')
const { promisify } = require('util')
const rimraf = promisify(require('rimraf'))

const generateManifest = require('./generate-manifest')

module.exports = async buildTarget => {
  try {
    await rimraf(path.resolve(__dirname, '../../build/'))
    await generateManifest(buildTarget)

    return 'done'
  } catch (e) {
    throw new Error(e)
  }
}
