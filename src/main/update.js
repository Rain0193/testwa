import { autoUpdater } from "electron-updater";
import { Menu } from "electron";
export default () => {
  if (process.mas) return;
  const menuItems = [
    Menu.getApplicationMenu().getMenuItemById("checkForUpdate"),
    Menu.getApplicationMenu().getMenuItemById("downloadingUpdate"),
    Menu.getApplicationMenu().getMenuItemById("restartToUpdate")
  ];
  const updateMenu = id => {
    for (const menuItem of menuItems) {
      // @ts-ignore
      menuItem.visible = menuItem.id === id ? true : false;
    }
  };
  updateMenu("checkForUpdate");
  autoUpdater.on("update-available", () => {
    updateMenu("downloadingUpdate");
  });

  autoUpdater.on("update-not-available", () => {
    updateMenu("checkForUpdate");
  });

  autoUpdater.on("update-downloaded", () => {
    updateMenu("restartToUpdate");
  });

  autoUpdater.on("error", () => {
    updateMenu("checkForUpdate");
  });

  autoUpdater.checkForUpdatesAndNotify();
};
