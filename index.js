const path = require('path')
const requireFromString = require('require-from-string')
const isObject = require('is-object')

// This function makes server rendering of asset references consistent with different webpack chunk/entry configurations
function normalizeAssets(assets) {
    if (isObject(assets)) {
        return Object.values(assets)
    }
    return Array.isArray(assets) ? assets : [assets]
}
function esModule(obj) {
    return obj && obj.__esModule ? obj.default : obj
}

const DEFAULTS = {
    chunkName: 'main'
}

module.exports = function HMRS(compiler, options) {
    options = Object.assign({}, DEFAULTS, options)

    const outputFs = compiler.outputFileSystem
    const outputPath = compiler.outputPath
    // installSourceMapSupport(outputFs)

    let middleware = (req, res, next) => {
        next()
    }

    const doneHandler = (serverStats) => {
        let assetsByChunkName = serverStats.toJson().assetsByChunkName

        let filename = normalizeAssets(assetsByChunkName[options.chunkName]).find(path => path.endsWith('.js'))

        let buffer = outputFs.readFileSync(path.join(outputPath, filename))

        middleware = esModule(requireFromString(buffer.toString(), filename))
        console.log(`[HMRS] ${filename} is up to date`)
    }

    // Webpack 4
    compiler.hooks.done.tap('HotloadServerMiddleware', doneHandler)

    return (...args) => {
        middleware.apply(null, args)
    }
}