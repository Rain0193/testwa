// import path from "path";
// import { ipcMain, BrowserWindow } from "electron";
// import wd from "wd";
// import request from "request-promise";
// import AppiumMethodHandler from "./appium-method-handler";

const server = require(".").main;
const app = server(
  {
    // port: 4723, // 监听的端口	--port 4723
    // callbackAddress: null, // 回调IP地址 (默认: 相同的IP地址)	--callback-address 127.0.0.1
    // callbackPort: null, // 回调端口号 (默认: 相同的端口号)	--callback-port 4723
    // log: null, // 将日志输出到指定文件	--log /path/to/appium.log
    // loglevel: "debug", // 日志级别; 默认 (console[:file]): debug[:debug]	--log-level debug
    // logTimestamp: false, // 在终端输出里显示时间戳
    // localTimezone: false, // 使用本地时间戳
    // relaxedSecurityEnabled: false, // 安全检查
    // webhook: null, // 同时发送日志到 HTTP 监听器	--webhook localhost:9876
    logHandler: (a, b) => console.error("log~~~~~~~~~~~~~~~~", a, b) // 日志监听方法
  },
  true
);
process.send(process.pid);
// export function createNewSessionWindow(win) {
//   // Create and open the Browser Window
//   let sessionWin = new BrowserWindow({
//     width: 920,
//     minWidth: 920,
//     height: 570,
//     minHeight: 570,
//     title: "Start Session",
//     backgroundColor: "#f2f2f2",
//     titleBarStyle: "hidden"
//   });
//   // note that __dirname changes based on whether we're in dev or prod;
//   // in dev it's the actual dirname of the file, in prod it's the root
//   // of the project (where main.js is built), so switch accordingly
//   // on Windows we'll get backslashes, but we don't want these for a browser URL, so replace
//   sessionWin.loadURL(
//     `file://${path.join(__dirname, "..", "browser", "index.html")}#/session`
//   );
//   sessionWin.show();

//   // When you close the session window, kill its associated Appium session (if there is one)
//   let sessionID = sessionWin.webContents.id;
//   sessionWin.on("closed", async () => {
//     const driver = sessionDrivers[sessionID];
//     if (driver) {
//       if (!driver._isAttachedSession) {
//         await driver.quit();
//       }
//       delete sessionDrivers[sessionID];
//     }
//     sessionWin = null;
//   });

//   // When the main window is closed, close the session window too
//   win.once("closed", () => {
//     sessionWin = null;
//   });
// }

// export function connectCreateNewSession() {
//   ipcMain.on("appium-create-new-session", async (event, args) => {
//     const {
//       desiredCapabilities,
//       host,
//       port,
//       path,
//       username,
//       accessKey,
//       https,
//       attachSessId
//     } = args;

//     // Create the driver and cache it by the sender ID
//     let driver = (sessionDrivers[event.sender.id] = wd.promiseChainReemote({
//       hostname: host,
//       port,
//       path,
//       username,
//       accessKey,
//       https
//     }));
//     appiumHandlers[event.sender.id] = new AppiumMethodHandler(driver);

//     // If we're just attaching to an existing session, do that and
//     // short-circuit the rest of the logic
//     if (attachSessId) {
//       driver._isAttachedSession = true;
//       try {
//         await driver.attach(attachSessId);
//         // get the session capabilities to prove things are working
//         await driver.sessionCapabilities();
//         event.sender.send("appium-new-session-ready");
//       } catch (e) {
//         // If the session failed to attach, delete it from the cache
//         event.sender.send("appium-new-session-failed", e);
//       }
//       return;
//     }

//     // Try initializing it. If it fails, kill it and send error message to sender
//     try {
//       let p = driver.init(desiredCapabilities);
//       event.sender.send("appium-new-session-successful");
//       await p;
//       // we don't really support the web portion of apps for a number of
//       // reasons, so pre-emptively ensure we're in native mode before doing the
//       // rest of the inspector startup. Since some platforms might not implement
//       // contexts, ignore any failures here.
//       try {
//         await driver.context("NATIVE_APP");
//       } catch (ign) {}
//       event.sender.send("appium-new-session-ready");
//     } catch (e) {
//       // If the session failed, delete it from the cache
//       event.sender.send("appium-new-session-failed", e);
//     }
//   });
// }

// export function connectClientMethodListener() {
//   ipcMain.on("appium-client-command-request", async (evt, data) => {
//     const {
//       uuid, // Transaction ID
//       methodName, // Optional. Name of method being provided
//       strategy, // Optional. Element locator strategy
//       selector, // Optional. Element fetch selector
//       fetchArray = false, // Optional. Are we fetching an array of elements or just one?
//       elementId, // Optional. Element being operated on
//       args = [], // Optional. Arguments passed to method
//       skipScreenshotAndSource = false // Optional. Do we want the updated source and screenshot?
//     } = data;

//     let renderer = evt.sender;
//     let methodHandler = appiumHandlers[renderer.id];

//     try {
//       if (methodName === "quit") {
//       } else {
//         let res = {};
//         if (methodName) {
//           if (elementId) {
//             console.log(
//               `Handling client method request with method '${methodName}', args ${JSON.stringify(
//                 args
//               )} and elementId ${elementId}`
//             );
//             res = await methodHandler.executeElementCommand(
//               elementId,
//               methodName,
//               args,
//               skipScreenshotAndSource
//             );
//           } else {
//             console.log(
//               `Handling client method request with method '${methodName}' and args ${JSON.stringify(
//                 args
//               )}`
//             );
//             res = await methodHandler.executeMethod(
//               methodName,
//               args,
//               skipScreenshotAndSource
//             );
//           }
//         } else if (strategy && selector) {
//           if (fetchArray) {
//             console.log(
//               `Fetching elements with selector '${selector}' and strategy ${strategy}`
//             );
//             res = await methodHandler.fetchElements(
//               strategy,
//               selector,
//               skipScreenshotAndSource
//             );
//           } else {
//             console.log(
//               `Fetching an element with selector '${selector}' and strategy ${strategy}`
//             );
//             res = await methodHandler.fetchElement(strategy, selector);
//           }
//         }

//         renderer.send("appium-client-command-response", {
//           ...res,
//           uuid
//         });
//       }
//     } catch (e) {
//       // If the status is '6' that means the session has been terminated
//       if (e.status === 6) {
//         console.log("Session terminated: e.status === 6");
//         renderer.send("appium-session-done", e);
//       }
//       console.log("Caught an exception: ", e);
//       renderer.send("appium-client-command-response-error", {
//         e: e.message,
//         uuid
//       });
//     }
//   });
// }

// function connectGetSessionsListener() {
//   ipcMain.on("appium-client-get-sessions", async (evt, data) => {
//     const { host, port, ssl } = data;
//     try {
//       const res = await request(
//         `http${ssl ? "s" : ""}://${host}:${port}/wd/hub/sessions`
//       );
//       evt.sender.send("appium-client-get-sessions-response", { res });
//     } catch (e) {
//       evt.sender.send("appium-client-get-sessions-fail");
//     }
//   });
// }
