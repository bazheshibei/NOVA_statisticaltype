'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')
const ipFile = require('../build/ip')

module.exports = {
  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/api_d': {
        target: 'http://10.10.0.226:8080/nova', // 晓东
        secure: false, // proxy https
        changeOrigin: true,
        pathRewrite: {
          '^/api_d': ''
        }
      },
      '/api_t': {
        target: 'http://192.168.9.116:8080/nova', // 邰
        secure: false, // proxy https
        changeOrigin: true,
        pathRewrite: {
          '^/api_t': ''
        }
      },
      '/api_f': {
        target: 'http://47.105.94.214:8083/nova', // 服务器
        secure: false, // proxy https
        changeOrigin: true,
        pathRewrite: {
          '^/api_f': ''
        }
      }
    },

    // Various Dev Server settings

    /* 自动获取 IP */
    host: ipFile.getIp(),
    // host: 'localhost', // can be overwritten by process.env.HOST

    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    // Use Eslint Loader?
    // If true, your code will be linted during bundling and
    // linting errors and warnings will be shown in the console.
    useEslint: true,
    // If true, eslint errors and warnings will also be shown in the error overlay
    // in the browser.
    showEslintErrorsInOverlay: false,

    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../statisticaltype/statisticaltype.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../statisticaltype'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
