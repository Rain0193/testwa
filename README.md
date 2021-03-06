# testwa-desktop

## 运行

```bash
git clone --recursive git@github.com:canfeit/testwa.git
cd testwa/static/minicap/
git checkout master
ndk-build
cd ../minitouch/
git checkout master
ndk-build
cd ../uiautomator2/
git checkout master
yarn&&yarn run version
cd ../
conda activate py2
yarn&&yarn start
```

## 项目架构

- react+styletron：实现 browser UI。
- electron：跨平台运行时。
- rust：UI 以外的高性能核心逻辑,通过 N-API 与 electron(node.js)交互。
- Electron 主进程(main process)通过 BrowserWindow 可以创建一个浏览器窗口——渲染进程(renderer process)，渲染进程加载 HTML 文档，不仅能创建 DOM 元素，同时能使用任意的 Node 模块，并且还可以通过 IPC 与主进程通讯。
- 主进程主要负责创建窗口和菜单，生命周期管理，自动更新等与系统相关的功能。绝大多数代码都是运行在渲染进程中的，渲染进程负责界面的显示，响应用户操作。
- 渲染进程还可以通过 Node 创建子进程。另外渲染进程还可以创建 Worker 执行一些复杂的计算，比如 xml 的解析。
- vscode 每一个渲染进程同时也对应一个插件进程，插件运行在单独的进程不会对渲染进程造成影响，这也是 vscode 比 atom 要快的原因。Atom 中插件是直接运行在渲染进程中的，所以当插件很多的时候会卡。同时又由于 vscode 的插件运行在一个普通的 Node 进程中，所以对 UI 的操作能力是比较弱的，这点不及 Atom。

## 项目结构

- browser 实现浏览器相关的功能。
- node 实现需要 node 模块支持的功能，比如文件操作。
- electron 实现需要 electron api 的功能，比如 ipc 通讯。
- rust 高性能核心功能。
- common 实现不依赖 node 模块的基本功能。

## 工作流程

Eletron 通过 package.json 中的 main 字段来定义应用入口。main.js 使用了 Eletron 的 ipc 模块发送接收渲染进程的消息，来实现主进程和渲染进程的交互。
在浏览器进程要获取主进程中的数据比较复杂(需要使用 ipc 通讯)。所以这里 loadurl（浏览器入口 index.html）时直接将一些基本信息打包成 config 传递给浏览器进程。

## TODOS

- appium 会替换 UIautomation2
- appium UIautomation2 无法回放
- one，two 启动冲突
- one 查找元素时无响应(性能问题？)
- ui 解析速度低于用户操作速度导致获取前一屏元素
- chrome 性能，调试
- react 跨组件通信
- electron 多渲染进程间通信
- testwa 服务间通信
