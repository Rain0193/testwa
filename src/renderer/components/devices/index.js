console.log("设备列表组件入口模块");
import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { ipcRenderer, remote } from "electron";
import "./devices.min.css";
export default class extends Component {
  constructor(props) {
    console.log("设备列表组件实例化");
    super(props);
    this.state = {
      devices: []
    };
    console.log("请求获取设备列表信息");
    ipcRenderer.send("devices"); // dev
    ipcRenderer.on("devices", (_event, devices) => {
      console.log("得到设备信息，修改state");
      this.setState({ devices });
    });
  }
  openDeviceWindow() {
    // @ts-ignore
    console.log("请求本地端口转发到", this.id);
    // @ts-ignore
    ipcRenderer.send("forward", this.id);
    // @ts-ignore
    const [width, height] = this.screen.split("x");
    console.log("创建录制窗口进程");
    let sessionWin = new remote.BrowserWindow({
      // frame: false,
      // center: true,
      // height: height * 2,
      // width: width,
      // resizable: false,
      // transparent: true,
      title: "脚本录制"
      // titleBarStyle: "hiddenInset"
    });
    if (remote.process.defaultApp) {
      console.log("开发环境");
      sessionWin.loadURL(
        `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?device=${
          // @ts-ignore
          this.id
          // @ts-ignore
        }&width=${width}`
      );
      sessionWin.webContents.openDevTools();
    } else {
      console.log("生产环境");
      sessionWin.loadURL(
        // @ts-ignore
        `file://${__dirname}/index.html?device=${this.id}&width=${width}`
      );
    }
    sessionWin.maximize();
    sessionWin.show();
  }
  render() {
    console.log("设备列表组件渲染");
    return this.state.devices.map(device => (
      <div key={device.id} className="marvel-device note8">
        <div className="inner" />
        <div className="overflow">
          <div className="shadow" />
        </div>
        <div className="speaker" />
        <div className="sensors" />
        <div className="more-sensors" />
        <div className="sleep" />
        <div className="volume" />
        <div className="camera" />
        <div className="screen">
          {device.brand || device.id} {device.type}
          {device.type !== "offline" ? (
            <div>
              {device.model}
              <br />
              Android {device.release} SDK {device.sdk}
              <br />
              {device.screen}
              <br />
              <Button onClick={this.openDeviceWindow.bind(device)}>开始</Button>
            </div>
          ) : (
            <div>设备已离线，请重新打开USB调试</div>
          )}
          {console.log(device.id, "渲染")}
        </div>
      </div>
    ));
  }
}
