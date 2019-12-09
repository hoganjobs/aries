const webpack = require("webpack");
module.exports = {
  publicPath: './', // 根域上下文目录
  outputDir: '../twin/pc', // 构建输出目录
  pages: {
    index: {
      // page 的入口
      entry: 'src/main.js',
      // 模板来源
      template: 'public/index.html',
      // 在 dist/wx_public_conf.html 的输出
      filename: 'index.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'index Page',
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },

  },
  lintOnSave:false, // 去除ESlint
  devServer: {
    // 配置接口代理
    proxy: {
      '/api': {
         // target: 'http://192.168.1.32:27777', // zz 本地
        target: 'http://192.168.1.33:27777', // 镇城 本地

        // target: 'http://ce.puzhizhuhai.com', // 测试服
        ws: true,
        changeOrigin: true
      },
    },
    overlay:{
      warning:false,
      errors:false
    },
  },

  //configureWebpack 是Vue CLI3.0 中用于配置 webpack 插件参数的地方，你在这里设置，会新建或者覆盖 webpack 默认配置。
  //webpack ProvidePlugin 的含义是创建一个全局的变量，使这个变量在 webpack 各个模块内都可以使用。这里的配置含义是创建 '$'、'jQuery'、'window.jQuery' 三个变量指向 jquery 依赖，创建 'Popper' 变量指向 popper.js 依赖。
  // configureWebpack: {
  //   plugins: [
  //     new webpack.ProvidePlugin({
  //       Popper: ['popper.js', 'default']
  //     })
  //   ]
  // }
}
