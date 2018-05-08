const client = require('adbkit').createClient()
let adb = exports.adb = require('appium-adb').ADB.createADB()
exports.getConnectedDevices = async (compont) => {
    adb = await adb
    const devices = await adb.getConnectedDevices()
    for (const device of devices) {
        adb.setDeviceId(device.udid)
        device.model = await adb.getDeviceProperty("ro.product.brand") + ' ' + await adb.getModel()
    }
    compont.setState({ devices: devices })
    const tracker = await client.trackDevices()
    tracker.on('changeSet', async (changes) => {
        for (const device of changes.removed) {
            let idx = devices.findIndex(e => e.udid === device.id);
            if (idx >= 0) {
                devices.splice(idx, 1);
            }
            compont.setState({ devices: devices })
        }
        for (const device of changes.changed) {
            let idx = devices.findIndex(e => e.udid === device.id);
            if (idx >= 0) {
                devices[idx].state = device.type;
            } else {
                adb.setDeviceId(device.id)
                devices.push({
                    udid: device.id,
                    state: device.type,
                    model: await adb.getDeviceProperty("ro.product.brand") + ' ' + await adb.getModel()
                });
            }
            compont.setState({ devices: devices })
        }
    })
}
