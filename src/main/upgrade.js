console.log("自动更新模块");
import { autoUpdater } from "electron-updater";
import { Menu } from "electron";
export default () => {
  const upgradeItems = [
    Menu.getApplicationMenu().getMenuItemById("isLatest"),
    Menu.getApplicationMenu().getMenuItemById("downloadingUpdate"),
    Menu.getApplicationMenu().getMenuItemById("restartToUpdate")
  ];
  const updateMenu = id => {
    for (const upgradeItem of upgradeItems) {
      // @ts-ignore
      upgradeItem.visible = upgradeItem.id === id;
    }
  };
  updateMenu("isLatest");
  autoUpdater.on("update-available", () => {
    updateMenu("downloadingUpdate");
  });

  autoUpdater.on("update-not-available", () => {
    updateMenu("isLatest");
  });

  autoUpdater.on("update-downloaded", () => {
    updateMenu("restartToUpdate");
  });

  autoUpdater.on("error", () => {
    updateMenu("isLatest");
  });
  console.log("准备检查更新");
  autoUpdater.checkForUpdates();
};
