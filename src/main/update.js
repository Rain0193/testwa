import { autoUpdater } from "electron-updater";
import { Menu } from "electron";
export default () => {
  if (process.mas) return;
  const menuItems = [
    Menu.getApplicationMenu().getMenuItemById("checkForUpdate"),
    Menu.getApplicationMenu().getMenuItemById("downloadingUpdate"),
    Menu.getApplicationMenu().getMenuItemById("restartToUpdate")
  ];
  for (const menuItem of menuItems)
    menuItem.visible = menuItem.id === "checkForUpdate" ? true : false;

  autoUpdater.on("update-available", () => {
    for (const menuItem of menuItems)
      menuItem.visible = menuItem.id === "downloadingUpdate" ? true : false;
  });

  autoUpdater.on("update-not-available", () => {
    for (const menuItem of menuItems)
      menuItem.visible = menuItem.id === "checkForUpdate" ? true : false;
  });

  autoUpdater.on("update-downloaded", () => {
    for (const menuItem of menuItems)
      menuItem.visible = menuItem.id === "restartToUpdate" ? true : false;
  });

  autoUpdater.on("error", () => {
    for (const menuItem of menuItems)
      menuItem.visible = menuItem.id === "checkForUpdate" ? true : false;
  });

  autoUpdater.checkForUpdatesAndNotify();
};
