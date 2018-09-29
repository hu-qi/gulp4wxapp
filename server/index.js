// 引入express
const express = require('express')
const path = require('path')
const {PORT} = require('../config.server.json')

const test_0_add = require('./cloud-functions/test_0_add').main
const test_1_zhihu = require('./cloud-functions/test_1_zhihu').main
const app = express()
// 使用 express.static 将 server/static 目录设置为静态资源服务器 可直接访问static文件夹下的文件
app.use('/static',express.static(path.join(__dirname, 'static'), {
  index: false,
  maxAge: '30d'
}))
// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world')
})

// 添加云函数mock
// req.query 传入云函数的main，构造一个云函数的 event 参数，用于获取云函数的参数，最后通过 Promise 的 then 传递给 res.json 输出
app.get('/api/add', (req, res, next) => {
  test_0_add(req.query).then(res.json.bind(res)).catch((e) => {
    console.error(e)
    next(e)
  })
})
app.get('/api/zhihu', (req, res, next) => {
  test_1_zhihu(req.query).then(res.json.bind(res)).catch((e) => {
    console.error(e)
    next(e)
  })
})

// 开启mock server端口
app.listen(PORT, () => {
  console.log(`开发服务器启动成功：http://127.0.0.1:${PORT}`)
})

// 引入 nodemon 对 server 目录下文件进行监控，发现文件修改，则重启 Node.js 服务。nodemon 的重启命令放在 package.json
// 启动mock server： nodemo index.js
// mock server端已实现一套代码本地和线上通过，client中通过jdists的trigger和remove实现wx.cloud.callFunction和wx.request切换
// api.js为线上云函数的调用 api-mock.js为本地127.0.0.1:3000/api接口的实现