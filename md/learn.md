/_------------nodejs 自带 api -------------_/

- process 进程

  - process.argv 返回一个数组，其中包含启动 nodejs 进程时的命令行参数
    第一个参数是 process.execpath.第二个参数是正在执行的 javascript 文件的路径 其余元素是任何其他命令行参数

  - process.env 返回包含用户环境的<对象>

_-----------------webpack-------------_

- MiniCssExtractPlugin

  - 将 css 提取到单独的文件中，为每个包含 css 的 js 文件创建一个 css 文件，并且支持 css 和 sourceMaps 的按需加载

- postcss-loader
  - PostCSS 是一个使 CSS 更容易，更灵活，更快速工作的工具。PostCSS 不是 一个“真正的”预处理器。PostCSS 相当于一个 CSS 解析器，框架或 API，它允许我们使用可以完成各种任务的插件。 它本身没有任何插件，为了更改原始 CSS，我们必须添加至少一个插件。
  - postcss-loader 用来对.css 文件进行处理，并添加在 style-loader 和 css-loader 之后。通过一个额外的 postcss 方法来返回所需要使用的 PostCSS 插件。
