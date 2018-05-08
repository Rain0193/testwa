const { app, shell } = require('electron');
const { autoUpdater } = require("electron-updater");

module.exports = [{
  label: '查看',
  submenu: [{
    label: '刷新',
    accelerator: 'Cmd/Ctrl+R',
    click: (_item, window) => {
      window.reload();
    }
  }, {
    label: '切换全屏',
    accelerator: (() => {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F'
      } else {
        return 'F11'
      }
    })(),
    click: (_item, window) => {
      window.setFullScreen(!window.isFullScreen());
    }
  }, {
    label: '调试',
    accelerator: (() => {
      if (process.platform === 'darwin') {
        return 'Alt+Command+I'
      } else {
        return 'Ctrl+Shift+I'
      }
    })(),
    click: (_item, window) => {
      window.toggleDevTools();
    }
  }]
}, {
  label: '帮助',
  submenu: [{
    label: '关于',
    click() {
      shell.openExternal('http://testwa.com/');
    }
  }, {
    label: '文档',
    click() {
      shell.openExternal('https://github.com/canfeit/testwa#readme');
    }
  }, {
    label: '社区',
    click() {
      shell.openExternal('http://forum.testwa.com/');
    }
  }, {
    label: '反馈',
    click() {
      shell.openExternal('https://github.com/canfeit/testwa/issues');
    }
  }, {
    label: `Version ${app.getVersion()}`,
    enabled: false
  }, {
    label: '正在检查更新',
    enabled: false,
    key: 'checkingForUpdate'
  }, {
    label: '检查更新',
    visible: false,
    key: 'checkForUpdate',
    click: function () {
      autoUpdater.checkForUpdatesAndNotify()
    }
  }, {
    label: '重启并安装更新',
    enabled: true,
    visible: false,
    key: 'restartToUpdate',
    click: function () {
      autoUpdater.quitAndInstall()
    }
  }]
}];
