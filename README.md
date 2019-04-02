# Webpack hotload server middleware

可以用于服务端热加载

## Usage
在server 端 webpack config 文件中添加对应路由的entry 
```
{
    name: 'server',
    target: 'node',
    entry: {
        index: ['./server/index.js']
    },
    output: {
        filename: '[name].min.js'
    },
}
```

根据路由文件设置服务端热更新， `hotload-server-middleware`模块返回一个函数，函数的第一个参数为server 端的 webpack compiler， 第二个参数为路由对于的 entry 名称。

```
const express = require('express')
const app = express()

const webpack = require('webpack')
const hotloadServerMiddleware = require('hotload-server-middleware')

const config = require('./webpack.config.server.js')
const compiler = webpack(config)


//根据路由添加对应entry 的 chunk, 第一个参数为相应的compiler，  第二个参数为路由对应entry 
let serverCompiler = compiler.compilers.find(compiler => compiler.name === 'server')


app.use('/', hotloadServerMiddleware(serverCompiler, { chunkName: 'index' }))


```

## Hot load all
配合 `webpack-dev-middleware` `webpack-hot-middleware` 实现前后端代码的热加载。

```
const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const hotloadServerMiddleware = require('hotload-server-middleware')

const config = require('./webpack/webpack.config.js')

const app = express()
const compiler = webpack(config)

app.use(
    webpackDevMiddleware(compiler, {
        logLevel: 'warn',
        serverSideRender: true
    })
)

app.use(
    webpackHotMiddleware(compiler.compilers.find(compiler => compiler.name === 'client'), {
        log: console.log,
        path: '/__hmr',
        heartbeat: 10 * 1000
    })
)
//根据路由添加对应entry 的 chunk, 第一个参数为相应的compiler，  第二个参数为路由对应entry 
let serverCompiler = compiler.compilers.find(compiler => compiler.name === 'server')

router.use('/', HMRS(serverCompiler, { chunkName: 'index' }))

```
### 正式环境
```
const express = require('express')
const app = express()
//webpack 编译后的对应路由的入口文件
let indexHandle = require('build/index.min.js')

app.use('/', indexHandle)

```

## Example

[react starter](https://github.com/yannliao/react-starter)
