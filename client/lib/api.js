// 初始化云开发
wx.cloud.init({
  env: 'node-edf49e'
})

export const test_0_add = () => {
  return wx.cloud.callFunction({
    name: 'test_0_add',
    data: {
      a: 1,
      b: 2
    }
  })
}

export const test_1_zhihu = () => {
  return wx.cloud.callFunction({
    name: "test_1_zhihu"
  })
}