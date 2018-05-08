const wd = require("wd");
const { createWriteStream } = require('fs')
const { join } = require('path');
const { tmpdir } = require("os");
const packageInfo = require('easy-aapt');
const adb = require('adbkit')
const client = exports.client = adb.createClient()
const getPackageInfo = async () => {
    const devices = await client.listDevices()
    const device = devices[0]
    const info = await client.getProperties(device.id)
    console.log(info)
    console.log(info["ro.product.brand"], info["ro.build.version.release"], info["ro.product.model"])
    const packages = await client.getPackages(device.id)
    console.log(packages)
    packages.map(pkg =>
        client.shell(device.id, `pm path ${pkg}`)
            .then(adb.util.readAll)
            .then(function (output) {
                const path = output.toString().trim().split(':')[1]
                const dir = join(tmpdir(), `${pkg}.apk`)
                client.pull(device.id, path).then(async transfer => {
                    transfer.pipe(createWriteStream(dir).on('close', async () => {
                        const info = await packageInfo(dir)
                        console.log(info)
                    }))
                })
            })
    )
}
exports.driver = wd.promiseChainRemote("0.0.0.0", 4723);
exports.info = getPackageInfo()
