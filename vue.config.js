module.exports = {
  pages: {
    index: {
      entry: 'examples/main.js',	// 样例
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  chainWebpack: config => {
    config.module.rule('js')
      .include
      .add('/packages/')
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap(options => {
        return options
      })
  },
   css: {
    extract: false	// 关联样式
  }
}