/_==============================js------------------_/

- Map new Map();

* map.clear() – 移除 Map 对象的所有键/值对 。
* map.set() – 设置键值对，返回该 Map 对象。
* map.get() – 返回键对应的值，如果不存在，则返回 undefined。
* map.has() – 返回一个布尔值，用于判断 Map 中是否包含键对应的值。
* map.delete() – 删除 Map 中的元素，删除成功返回 true，失败返回 false。
* map.size – 返回 Map 对象键/值对的数量。
* map.keys() - 返回一个 Iterator 对象， 包含了 Map 对象中每个元素的键 。
* map.values() – 返回一个新的 Iterator 对象，包含了 Map 对象中每个元素的值 。

/_------------nodejs 自带 api -------------_/

- process 进程

  - process.argv 返回一个数组，其中包含启动 nodejs 进程时的命令行参数
    第一个参数是 process.execpath.第二个参数是正在执行的 javascript 文件的路径 其余元素是任何其他命令行参数

  - process.env 返回包含用户环境的<对象>

_-----------------webpack-------------_

- MiniCssExtractPlugin

  - 将 css 提取到单独的文件中，为每个包含 css 的 js 文件创建一个 css 文件，并且支持 css 和 sourceMaps 的按需加载

- postcss-loader css 的压缩解析器

  - PostCSS 是一个使 CSS 更容易，更灵活，更快速工作的工具。PostCSS 不是 一个“真正的”预处理器。PostCSS 相当于一个 CSS 解析器，框架或 API，它允许我们使用可以完成各种任务的插件。 它本身没有任何插件，为了更改原始 CSS，我们必须添加至少一个插件。
  - postcss-loader 用来对.css 文件进行处理，并添加在 style-loader 和 css-loader 之后。通过一个额外的 postcss 方法来返回所需要使用的 PostCSS 插件。

    /_--------------------ts-------------_/

    类型断言 as
    implements

    type 和 interface
    interface 可以 extends， 但 type 是不允许 extends 和 implement 的，但是 type 可以通过交叉类型 实现 interface 的 extend 行为，并且两者并不是相互独立的，也就是说 interface 可以 extends type, type 也可以 与 interface 类型 交叉

    ```
            interface Name {
        name: string;
        }
        interface User extends Name {
        age: number;
        }

        type 与 type 交叉

        type Name = {
        name: string;
        }
        type User = Name & { age: number };
    ```

  /_-------------------redux-saga----------_/

action - > reduxMiddleWare -> store ;

action -> 处理请求方式(saga) (发送请求) -> 请求数据回来，对数据进行处理 reducer (函数已经处理好) ->store

/_-----------------history_/ history 对象共同的特点，共同维护一个地址栈

- createBrowserHistory 产生的控制浏览器真实地址</br>的 history 对象
- createHashHistory 产生的控制浏览器 hash 的 history 对象
- createMemoryHistory 产生的控制内存中地址的 history 对象
