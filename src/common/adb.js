exports.client = require("adbkit").createClient(); //弥补appium-adb shell接口异常
exports.adb = require("appium-adb").ADB.createADB(); //提供getScreenSize接口
exports.trackDevices = async compont => {
  const adb = await exports.adb;
  const client = exports.client;
  const getModel = async deviceId => {
    adb.setDeviceId(deviceId);
    return (await Promise.all([
      adb.getDeviceProperty("ro.product.brand"),
      adb.getModel()
    ])).join(" ");
  };
  const deviceServer = async deviceId => {
    adb.setDeviceId(deviceId);
    const [deviceCPU, deviceSDK] = await Promise.all([
      adb.getDeviceProperty("ro.product.cpu.abi"),
      adb.getDeviceProperty("ro.build.version.sdk")
    ]);
    await Promise.all([
      client.push(
        deviceId,
        // @ts-ignore
        `${__static}/minicap/libs/${deviceCPU}/minicap`,
        "/data/local/tmp/minicap",
        511
      ),
      client.push(
        deviceId,
        // @ts-ignore
        `${__static}/minitouch/libs/${deviceCPU}/minitouch`,
        "/data/local/tmp/minitouch",
        511
      ),
      client.push(
        deviceId,
        // @ts-ignore
        `${__static}/minicap/jni/minicap-shared/aosp/libs/android-${deviceSDK}/${deviceCPU}/minicap.so`,
        "/data/local/tmp/minicap.so"
      )
    ]);
    let screen = await adb.getScreenSize();
    screen = `${screen}@${screen}/0`;
    // 启动手机端服务
    await Promise.all([
      client.shell(
        deviceId,
        `LD_LIBRARY_PATH=/data/local/tmp /data/local/tmp/minicap -P ${screen}`
      ),
      client.shell(deviceId, `/data/local/tmp/minitouch`)
    ]);
    // 本地端口转发
    adb.forwardAbstractPort(1717, "minicap");
    adb.forwardAbstractPort(1718, "minitouch");
  };
  const devices = await adb.getConnectedDevices();
  for (const device of devices) {
    device.model = await getModel(device.udid);
    deviceServer(device.udid);
  }
  compont.setState({ devices: devices });

  (await client.trackDevices()).on("changeSet", async changes => {
    for (const device of changes.removed) {
      let idx = devices.findIndex(e => e.udid === device.id);
      if (idx >= 0) devices.splice(idx, 1);
    }
    for (const device of changes.changed) {
      let idx = devices.findIndex(e => e.udid === device.id);
      if (idx >= 0) devices[idx].state = device.type;
      else {
        devices.push({
          udid: device.id,
          state: device.type,
          model: await getModel(device.id)
        });
        deviceServer(device.id);
      }
    }
    compont.setState({ devices: devices });
  });
};
