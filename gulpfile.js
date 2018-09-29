// 依赖
const gulp = require('gulp')
const rename = require('gulp-rename')
const del = require('del')

const through = require('through2')
const colors = require('ansi-colors')
const log = require('fancy-log')
const argv = require('minimist')(process.argv.slice(2))

const postcss = require('gulp-postcss')
const pxtorpx = require('postcss-px2rpx')
const base64 = require('postcss-font-base64')

const htmlmin = require('gulp-htmlmin')
const sass = require('gulp-sass')
const jsonminify = require('gulp-jsonminify')
const combiner = require('stream-combiner2')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const cssnano = require('gulp-cssnano')
const runSequence = require('run-sequence')
const sourcemaps = require('gulp-sourcemaps')
const filter = require('gulp-filter')
// 引入代码块预处理jdists
const jdists = require('gulp-jdists')

// 配置
// 将 client 目录下的文件，编译到小程序开发者工具实际运行的 dist 目录下
const src = './client'
const dist = './dist'
// 通过 --type prod 区分生产发布打包和开发发布打包 
const isProd = argv.type === 'prod'

// 处理报错
const handleError = (err) => {
  console.log('\n')
  log(colors.red('Error!'))
  log('fileName: ' + colors.red(err.fileName))
  log('lineNumber: ' + colors.red(err.lineNumber))
  log('message: ' + err.message)
  log('plugin: ' + colors.yellow(err.plugin))
}

// task
// 压缩打包wxml
gulp.task('wxml', () => {
  return gulp.src(`${src}/**/*.wxml`)
    .pipe(isProd ? htmlmin({ collapseWhitespace: true, removeComments: true, keepClosingSlash: true }) : through.obj())
    .pipe(gulp.dest(dist))
})
// 项目使用sass开发wxss，先将scss/sass文件编译成wxss，同时将px转成rpx，webfont转成base64引入.
// 如果不使用css自动添加浏览器兼容前缀的autoprefixer插件 则可以在微信开发者工具中打开上传代码时样式自动补全
gulp.task('wxss', () => {
  const combined = combiner.obj([
    gulp.src(`${src}/**/*.{wxss,scss}`),
    sass().on('error', sass.logError),
    postcss([pxtorpx(), base64()]),
    isProd ? cssnano({ autoprefixer: false, discardComments: { removeAll: true } }) : through.obj(),
    rename((path) => (path.extname = '.wxss')),
    gulp.dest(dist)
  ])
  combined.on('error', handleError)
})

// 项目中可用ES6/7 通过babel编译，引用sourcemap方便本地代码debug
gulp.task('js', () => {
  const f = filter((file) => !/(mock|bluebird)/.test(file.path))
  gulp.src(`${src}/**/*.js`)
  // 
    .pipe(isProd ? f : through.obj())
  // 如果是生产环境 触发jdists的prod trigger，暴露不同的代码块，这里开发环境启用api-mock
    .pipe(isProd ? jdists({ trigger: 'prod' }) : jdists({ trigger: 'dev' }))
    // 生产环境不生成sourcemap则传入空的流处理方法
    .pipe(isProd ? through.obj() : sourcemaps.init())
    // babel处理js
    .pipe(babel({ presets: ['env'] }))
    // 生产环境压缩js
    .pipe(isProd ? uglify({ compress: true }) : through.obj())
    // 生产环境不写入sourcemap则传入空的流处理方法
    .pipe(isProd ? through.obj() : sourcemaps.write('./'))
    .pipe(gulp.dest(dist))
})
// 处理json、wxs、images,按照当前路径复制到目标目录
gulp.task('json', () => {
  return gulp.src(`${src}/**/*.json`)
    .pipe(isProd ? jsonminify() : through.obj())
    .pipe(gulp.dest(dist))
})

gulp.task('wxs', () => {
  return gulp.src(`${src}/**/*.wxs`)
    .pipe(gulp.dest(dist))
})

gulp.task('images', () => {
  return gulp.src(`${src}/images/**`)
    .pipe(gulp.dest(`${dist}/images`))
})
// 文件监听
gulp.task('watch', () => {
  ;['wxml', 'wxss', 'js', 'json', 'wxs'].forEach((v) => {
    gulp.watch(`${src}/**/*.${v}`, [v])
  })
  gulp.watch(`${src}/images/**`, ['images'])
  gulp.watch(`${src}/**/*.scss`, ['wxss'])
})
// 清除dist
gulp.task('clean', () => {
  return del(['./dist/**'])
})
// 本地运行
gulp.task('dev', ['clean'], () => {
  runSequence('json', 'wxml', 'wxs', 'wxss', 'images', 'js', 'cloud', 'watch')
})
// 打包
gulp.task('build', ['clean'], () => {
  runSequence('json', 'wxml', 'wxs', 'wxss', 'images', 'js', 'cloud')
})

// cloud-function 处理方法
const cloudPath = './server/cloud-functions'
gulp.task('cloud', () => {
  return gulp.src(`${cloudPath}/**`)
    .pipe(isProd ? jdists({ trigger: 'prod' }) : jdists({ trigger: 'dev' }))
    .pipe(gulp.dest(`${dist}/cloud-functions`))
})

gulp.task('watch:cloud', () => {
  gulp.watch(`${cloudPath}/**`, ['cloud'])
})

gulp.task('cloud:dev', () => {
  runSequence('cloud', 'watch:cloud')
})