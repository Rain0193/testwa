console.log("adb封装模块");
import { ipcMain } from "electron";
import adbkit from "adbkit";
export const client = adbkit.createClient();
ipcMain.on("forward", (_, deviceID) => {
  console.log("端口映射到", deviceID);
  client.forward(deviceID, "tcp:1717", "localabstract:minicap");
  client.forward(deviceID, "tcp:1718", "localabstract:minitouch");
  client.forward(deviceID, "tcp:4444", "tcp:6790");
});
export default async window => {
  ipcMain.on("recordedActions", (_, recordedActions) =>
    window.webContents.send("recordedActions", recordedActions)
  );
  console.log("获取设备列表");
  const devices = await client.listDevices();
  const getDeviceProperties = async device => {
    console.log("获取设备详细信息", device.id);
    const [properties, screen] = await Promise.all([
      client.getProperties(device.id),
      adbkit.util.readAll(await client.shell(device.id, "wm size"))
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
    console.log("推送服务文件到", device.id);
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
            `${__static}/uiautomator2/apks/uiautomator2-server.apk`
          ),
      (await client.isInstalled(
        device.id,
        "io.appium.uiautomator2.server.test"
      ))
        ? true
        : client.install(
            device.id,
            // @ts-ignore
            `${__static}/uiautomator2/apks/uiautomator2-test.apk`
          )
    ]);
    console.log("启动安卓端服务", device.id);
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
  for (const device of devices) {
    if (device.type === "offline") continue;
    Promises.push(getDeviceProperties(device));
  }
  await Promise.all(Promises);
  if (devices.length) {
    console.log("发送设备信息列表");
    window.webContents.send("devices", devices);
  }
  for (const device of devices) {
    if (device.type === "offline") continue;
    push2Device(device);
  }
  console.log("监听设备变化");
  (await client.trackDevices()).on("changeSet", async changes => {
    if (!changes.removed.length && !changes.changed.length) return;
    for (const device of changes.removed) {
      console.log(device.id, "离开");
      let idx = devices.findIndex(e => e.id === device.id);
      if (idx >= 0) devices.splice(idx, 1);
    }
    for (const device of changes.changed) {
      let idx = devices.findIndex(e => e.id === device.id);
      if (idx >= 0) {
        console.log(device.id, device.type);
        devices[idx].type = device.type;
      } else {
        console.log(device.id, "进入");
        await getDeviceProperties(device);
        devices.push(device);
        push2Device(device);
      }
    }
    console.log("发送新设备信息列表");
    window.webContents.send("devices", devices);
  });
  // dev
  console.log("监听获取设备信息的请求");
  ipcMain.on("devices", () => {
    console.log("响应获取设备信息的请求");
    if (devices.length) {
      console.log("发送设备信息列表");
      window.webContents.send("devices", devices);
    }
  });
};
