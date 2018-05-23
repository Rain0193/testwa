import { ipcMain } from "electron";
// @ts-ignore
import { util, createClient } from "adbkit";
export const client = createClient();
ipcMain.on("forward", (_event, deviceID) => {
  client.forward(deviceID, "tcp:1717", "localabstract:minicap");
  // @ts-ignore
  client.forward(deviceID, "tcp:1718", "localabstract:minitouch");
  // @ts-ignore
  client.forward(deviceID, "tcp:4444", "tcp:6790");
});
export default async window => {
  const devices = await client.listDevices();
  const getDeviceProperties = async device => {
    const [properties, screen] = await Promise.all([
      client.getProperties(device.id),
      util.readAll(await client.shell(device.id, "wm size"))
    ]);
    device.brand = properties["ro.product.brand"];
    device.model = properties["ro.product.model"];
    device.cpu = properties["ro.product.cpu.abi"];
    device.sdk = properties["ro.build.version.sdk"];
    device.release = properties["ro.build.version.release"];
    device.screen = new RegExp(/Physical size: ([^\r?\n]+)*/g)
      .exec(screen)[1]
      .trim();
  };
  const push2Device = async device => {
    // 推送服务到安卓
    await Promise.all([
      client.push(
        device.id,
        // @ts-ignore
        `${__static}/minicap/libs/${device.cpu}/minicap`,
        "/data/local/tmp/minicap",
        511
      ),
      client.push(
        device.id,
        // @ts-ignore
        `${__static}/minitouch/libs/${device.cpu}/minitouch`,
        "/data/local/tmp/minitouch",
        511
      ),
      client.push(
        device.id,
        // @ts-ignore
        `${__static}/minicap/jni/minicap-shared/aosp/libs/android-${
          device.sdk
        }/${device.cpu}/minicap.so`,
        "/data/local/tmp/minicap.so",
        511
      ),
      (await client.isInstalled(device.id, "io.appium.uiautomator2.server"))
        ? true
        : client.install(
            device.id,
            // @ts-ignore
            __static + "/apks/appium-uiautomator2-server-v1.12.0.apk"
          ),
      (await client.isInstalled(
        device.id,
        "io.appium.uiautomator2.server.test"
      ))
        ? true
        : client.install(
            device.id,
            // @ts-ignore
            __static + "/apks/appium-uiautomator2-server-debug-androidTest.apk"
          )
    ]);
    // 启动安卓端服务
    client.shell(
      device.id,
      `LD_LIBRARY_PATH=/data/local/tmp /data/local/tmp/minicap -P ${
        device.screen
      }@${device.screen
        .split("x")
        .map(data => data / 2)
        .join("x")}/0`
    );
    client.shell(device.id, `/data/local/tmp/minitouch`);
    client.shell(
      device.id,
      `am instrument -w --no-window-animation io.appium.uiautomator2.server.test/android.support.test.runner.AndroidJUnitRunner`
    );
  };
  const Promises = [];
  for (const device of devices) Promises.push(getDeviceProperties(device));
  await Promise.all(Promises);
  window.webContents.send("devices", devices);
  for (const device of devices) push2Device(device);
  (await client.trackDevices()).on("changeSet", async changes => {
    for (const device of changes.removed) {
      let idx = devices.findIndex(e => e.id === device.id);
      if (idx >= 0) devices.splice(idx, 1);
    }
    for (const device of changes.changed) {
      let idx = devices.findIndex(e => e.id === device.id);
      if (idx >= 0) devices[idx].type = device.type;
      else {
        await getDeviceProperties(device);
        devices.push(device);
        push2Device(device);
      }
    }
    window.webContents.send("devices", devices);
  });
};
