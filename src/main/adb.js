export default async window => {
  const client = require("adbkit").createClient();
  const devices = await client.listDevices();
  const getDeviceProperties = async device => {
    const [properties, screen] = await Promise.all([
      client.getProperties(device.id),
      require("adbkit").util.readAll(await client.shell(device.id, "wm size"))
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
  const pushSTF2Device = async device => {
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
      )
    ]);
    // 启动手机端服务
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
  };
  for (const device of devices) {
    await getDeviceProperties(device);
    pushSTF2Device(device);
  }
  window.webContents.send("devices", devices);
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
        pushSTF2Device(device);
      }
    }
    window.webContents.send("devices", devices);
  });
};
