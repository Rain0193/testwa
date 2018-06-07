// @ts-check
"use strict";
console.log("主进程入口模块");
import { app, Menu, BrowserWindow } from "electron";
import menu from "./menu";
import upgrade from "./upgrade";
import trackDevices from "./adb";
async function createMainWindow() {
  console.log("请求创建主窗口进程");
  const mainWindow = new BrowserWindow();
  console.log("请求监听设备状态");
  trackDevices(mainWindow);
  if (process.defaultApp) {
    console.log("开发环境");
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(
      `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
    );
  } else {
    console.log("生产环境");
    mainWindow.loadURL(`file://${__dirname}/index.html`);
  }
  mainWindow.maximize();
  // @ts-ignore
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  upgrade();
}
app.commandLine.appendSwitch("enable-experimental-web-platform-features");
app.once("ready", createMainWindow);
app.once("before-quit", () => {
  console.log("准备退出");
});
app.once("window-all-closed", app.quit);
