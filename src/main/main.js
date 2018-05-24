// @ts-check
"use strict";
import { app, Menu, BrowserWindow } from "electron";
import menu from "./menu";
import upgrade from "./upgrade";
import trackDevices from "./adb";
// import { fork } from "child_process";
// const prepareNext = require('electron-next')
async function createMainWindow() {
  // await prepareNext('../renderer')
  const mainWindow = new BrowserWindow();
  trackDevices(mainWindow);
  if (process.defaultApp) {
    // fork(`${__dirname}/../../testwa/start_cp`);
    mainWindow.loadURL(
      `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
    );
    mainWindow.webContents.openDevTools();
  } else {
    // fork(`${__dirname}/testwa/start_cp`);
    mainWindow.loadURL(`file://${__dirname}/index.html`);
  }
  mainWindow.maximize();
  // @ts-ignore
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  upgrade();
}
app.commandLine.appendSwitch("enable-experimental-web-platform-features");
app.once("ready", createMainWindow);
app.once("window-all-closed", app.quit);
