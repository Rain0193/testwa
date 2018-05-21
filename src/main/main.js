"use strict";
import { app, Menu, BrowserWindow } from "electron";
import menu from "./menu";
import upgrade from "./upgrade";
import trackDevices from "./adb";
// const prepareNext = require('electron-next')
async function createMainWindow() {
  // await prepareNext('../renderer')
  const mainWindow = new BrowserWindow();
  trackDevices(mainWindow);
  if (process.defaultApp) {
    mainWindow.webContents.openDevTools();
    mainWindow.maximize();
    mainWindow.loadURL(
      `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
    );
  } else {
    mainWindow.loadURL(
      require("url").format({
        protocol: "file",
        slashes: true,
        pathname: require("path").join(__dirname, "index.html")
      })
    );
  }
  // mainWindow.once('ready-to-show', () => {
  //   mainWindow.maximize()
  //   mainWindow.show()
  //   mainWindow.focus();
  // })
  // mainWindow.webContents.on('did-finish-load', () => {
  //   mainWindow.maximize()
  //   mainWindow.show();
  //   mainWindow.focus();
  // });
  // @ts-ignore
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  upgrade();
}

app.commandLine.appendSwitch("enable-experimental-web-platform-features");

app.once("ready", createMainWindow);

app.once("window-all-closed", app.quit);
