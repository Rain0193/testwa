const cpEvent = cp => {
    return new Promise((resolve, reject) => {
        cp.stdout.on('data', process.stdout.write);
        cp.stderr.on('data', process.stderr.write);
        cp.on('error', reject);
        cp.on('exit', resolve);
    })
}

(async () => {
    await cpEvent(
        require("child_process").spawn('nvm', [
            'use',
            `v${process.versions.node}`
        ])
    )
    await cpEvent(
        require("child_process").spawn(process.platform === "win32" ? "cnpm.cmd" : "cnpm", ['i', '--save-dev',
            'electron-builder@next',
            'standard-version',
            '@babel/core',
            '@babel/preset-env',
            '@babel/preset-react',
            '@babel/register',
            'babel-loader@next',
            'css-loader',
            'file-loader',
            'url-loader',
            'webpack',
            'webpack-cli',
            'uglifyjs-webpack-plugin',
            'react@next',
            'react-dom@next',
            'font-awesome',
            'history',
            'mini-css-extract-plugin',
            'optimize-css-assets-webpack-plugin',
            "react-hot-loader",
            "webpack-serve@next"
        ])
    )
    const subProcess = require("child_process").spawn(process.platform === "win32" ? "cmd" : "bash")
    // subProcess.stdin.write('cd app \n')
    subProcess.stdin.write('conda activate py2 \n')
    subProcess.stdin.write(`${process.platform === "win32" ? "cnpm.cmd" : "cnpm"} i --save \
    electron-updater@next \
    emailjs-utf7 \
    minicap@beta \
    appium-adb \
    appium \n`);
    subProcess.stdin.end();
    await cpEvent(subProcess)
    require("process").exit()
})()