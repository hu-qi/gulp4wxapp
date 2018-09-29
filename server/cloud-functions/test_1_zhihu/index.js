/* 
* 云函数
* 部署：
*  一. 在管理台新建一个 名为 test 的云函数，进行函数配置编辑
*  二.部署云函数(请在微信开发者工具中上传云函数代码，指引：)
*     1.请先配置云函数的根目录（如已配置请忽略此步骤）
*       a. 在项目文件project.config.json 里增加字段 "cloudfunctionRoot": "./functions"
*       b. 在微信开发者工具中重新载入项目，即可看到带有云标记的云函数目录
*     2.在微信开发者工具中，右击云函数test目录，选择‘上传并部署’，即可同步至云端
* */

// 支持引入公共模块
/*<jdists import="../../inline/utils" />*/

// test_1_zhuhu 实现从知乎爬取数据
const request = require('request')
const cheerio = require('cheerio')
exports.main = async (context) => {
  console.log(context)
  return new Promise((resolve, reject) => {
    request({
      url: 'https://www.zhihu.com/node/ExploreAnswerListV2'
    }, (err, resp) => {
      let $ = cheerio.load(resp.body)
      var items = []
      let baseUrl = 'https://www.zhihu.com'
      $('.explore-feed').each(function (index, el) {
        let $el = $(el)
        let tittle = $el.find('h2 a').text().replace(/[\r\n]/g, '')
        let href = baseUrl +  $el.find('.question_link').attr('href')
        let author = $el.find('.author-link').text()
        items.push({ title: tittle, href: href, author: author })
      })
      resolve({
        openid: context.userInfo?context.userInfo.openId: '' || '' ,
        items
      })
    })
  })
}