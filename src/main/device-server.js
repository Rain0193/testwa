const client = require('adbkit').createClient()//弥补appium-adb shell接口异常
let adb = require('common/adb').adb//提供getScreenSize接口
exports.start = async () => {
    adb = await adb
    const devices = await adb.getConnectedDevices()
    for (const device of devices) {
        adb.setDeviceId(device.udid)
        const deviceModel = await adb.getDeviceProperty("ro.product.brand") + ' ' + await adb.getModel()
        const deviceCPU = await adb.getDeviceProperty('ro.product.cpu.abi')
        const deviceSDK = await adb.getDeviceProperty('ro.build.version.sdk')
        await adb.push(`${__dirname}/../minicap/libs/${deviceCPU}/minicap`, '/data/local/tmp')
        await adb.push(`${__dirname}/../minitouch/libs/${deviceCPU}/minitouch`, '/data/local/tmp')
        await adb.push(`${__dirname}/../minicap/jni/minicap-shared/aosp/libs/android-${deviceSDK}/${deviceCPU}/minicap.so`, '/data/local/tmp/')
        await client.shell(device.udid, ['chmod', '777', '/data/local/tmp/minicap'])
        await client.shell(device.udid, ['chmod', '777', '/data/local/tmp/minitouch'])
        let screen = await adb.getScreenSize()
        screen = `${screen}@480x850/0`
        // 启动手机端服务
        await client.shell(device.udid, `LD_LIBRARY_PATH=/data/local/tmp /data/local/tmp/minicap -P ${screen}`)
        await client.shell(device.udid, `/data/local/tmp/minitouch`)
        // 本地端口转发
        adb.forwardAbstractPort(1717, 'minicap')
        adb.forwardAbstractPort(1718, 'minitouch')
        console.log(`${deviceModel} CPU ${deviceCPU} SDK ${deviceSDK} ${screen} minicap&minitouch started`)
    }
}
