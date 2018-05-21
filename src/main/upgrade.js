import { autoUpdater } from "electron-updater";
import { Menu } from "electron";
export default () => {
  if (process.mas) return;
  const upgradeItems = [
    Menu.getApplicationMenu().getMenuItemById("isLatest"),
    Menu.getApplicationMenu().getMenuItemById("downloadingUpdate"),
    Menu.getApplicationMenu().getMenuItemById("restartToUpdate")
  ];
  const updateMenu = id => {
    for (const upgradeItem of upgradeItems) {
      // @ts-ignore
      upgradeItem.visible = upgradeItem.id === id ? true : false;
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

  autoUpdater.checkForUpdatesAndNotify();
};
