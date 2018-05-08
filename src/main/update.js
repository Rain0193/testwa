const { autoUpdater } = require("electron-updater");
const { Menu } = require('electron')
let state = 'checking'
export default () => {
    if (process.mas) return

    autoUpdater.on('checking-for-update', () => {
        state = 'checking'
        exports.updateMenu()
    })

    autoUpdater.on('update-available', () => {
        state = 'checking'
        exports.updateMenu()
    })

    autoUpdater.on('update-downloaded', () => {
        state = 'installed'
        exports.updateMenu()
    })

    autoUpdater.on('update-not-available', () => {
        state = 'no-update'
        exports.updateMenu()
    })

    autoUpdater.on('error', () => {
        state = 'no-update'
        exports.updateMenu()
    })

    autoUpdater.checkForUpdates()
}

exports.updateMenu = () => {
    const menu = Menu.getApplicationMenu()
    menu.items.forEach(item => {
        if (item.submenu) {
            item.submenu.items.forEach(item => {
                switch (item.key) {
                    case 'checkForUpdate':
                        item.visible = state === 'no-update'
                        break
                    case 'checkingForUpdate':
                        item.visible = state === 'checking'
                        break
                    case 'restartToUpdate':
                        item.visible = state === 'installed'
                        break
                }
            })
        }
    })
}
