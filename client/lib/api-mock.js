import Promise from './bluebird.js'

export const test_0_add = () => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://127.0.0.1:3000/api/add',
      success: (res) => {
        resolve({result: res.data})
      },
      fall: (e) => {
        reject(e)
      }
    })
  })
}

export const test_1_zhihu = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://127.0.0.1:3000/api/zhihu',
      data,
      success: (res) => {
        resolve({result: res.data})
      },
      fall: (e) => {
        reject(e)
      }
    })
  })
}