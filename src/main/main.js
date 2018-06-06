// @ts-check
"use strict";
console.log("主进程入口模块");
import { app, Menu, BrowserWindow } from "electron";
import menu from "./menu";
import upgrade from "./upgrade";
import trackDevices from "./adb";
async function createMainWindow() {
  console.log("创建主窗口进程");
  console.log("请求监听设备状态");
  const mainWindow = new BrowserWindow();
  trackDevices(mainWindow);
  if (process.defaultApp) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(
      `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
    );
  } else {
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
  // client.kill();
});
