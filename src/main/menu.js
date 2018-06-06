console.log("菜单栏模块");
import { app, shell, dialog } from "electron";
import { autoUpdater } from "electron-updater";
export default [
  {
    label: "查看",
    submenu: [
      {
        label: "刷新",
        role: "reload"
      },
      {
        label: "切换全屏",
        role: "togglefullscreen"
      },
      {
        label: "调试",
        role: "toggledevtools"
      }
    ]
  },
  {
    label: "帮助",
    submenu: [
      {
        label: "云测平台",
        click() {
          shell.openExternal("http://cloud.testwa.com/");
        }
      },
      {
        label: "在线文档",
        click() {
          shell.openExternal("https://github.com/canfeit/testwa#readme");
        }
      },
      {
        label: "互动社区",
        click() {
          shell.openExternal("http://forum.testwa.com/");
        }
      },
      {
        label: "意见反馈",
        click() {
          shell.openExternal("https://github.com/canfeit/testwa/issues");
        }
      },
      {
        type: "separator"
      },
      {
        label: "关于",
        click: () => {
          dialog.showMessageBox({
            title: "关于",
            message: `Testwa 版本 ${app.getVersion()}
♥Testwa 的诞生离不开以下开源项目♥
            Electron ${process.versions.electron}
            Chromium ${process.versions.chrome}
            Node.js ${process.versions.node}`
          });
        }
      },
      {
        label: "已是最新",
        id: "isLatest",
        enabled: false
      },
      {
        label: "正在下载更新",
        id: "downloadingUpdate",
        enabled: false
      },
      {
        label: "重启并安装更新",
        id: "restartToUpdate",
        click: autoUpdater.quitAndInstall
      }
    ]
  }
];
