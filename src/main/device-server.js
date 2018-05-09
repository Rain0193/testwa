// @ts-ignore
const client = require("adbkit").createClient(); //弥补appium-adb shell接口异常
// @ts-ignore
let adb = require("common/adb").adb; //提供getScreenSize接口
var log = require("electron-log");
log.error(111);

exports.start = async () => {
  adb = await adb;
  const devices = await adb.getConnectedDevices();
  log.error(111, devices);
  try {
    for (const device of devices) {
      adb.setDeviceId(device.udid);
      const deviceModel =
        (await adb.getDeviceProperty("ro.product.brand")) +
        " " +
        (await adb.getModel());
      const deviceCPU = await adb.getDeviceProperty("ro.product.cpu.abi");
      const deviceSDK = await adb.getDeviceProperty("ro.build.version.sdk");
      await Promise.all([
        client.push(
          device.udid,
          // @ts-ignore
          `${__static}/minicap/libs/${deviceCPU}/minicap`,
          "/data/local/tmp/minicap",
          0o777
        ),
        client.push(
          device.udid,
          // @ts-ignore
          `${__static}/minitouch/libs/${deviceCPU}/minitouch`,
          "/data/local/tmp/minitouch",
          0o777
        ),
        client.push(
          device.udid,
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
          device.udid,
          `LD_LIBRARY_PATH=/data/local/tmp /data/local/tmp/minicap -P ${screen}`
        ),
        client.shell(device.udid, `/data/local/tmp/minitouch`)
      ]);
      // 本地端口转发
      adb.forwardAbstractPort(1717, "minicap");
      adb.forwardAbstractPort(1718, "minitouch");
      log.error(
        `${deviceModel} CPU ${deviceCPU} SDK ${deviceSDK} ${screen} minicap&minitouch started`
      );
    }
  } catch (e) {
    log.error(e);
  }
};
