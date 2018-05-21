import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { ipcRenderer, remote } from "electron";
import "./devices.min.css";
const client = require("adbkit").createClient();

class App extends Component {
  constructor() {
    // @ts-ignore
    super();
    const { fork } = require("child_process");
    const server = remote.process.defaultApp
      ? fork(`${__dirname}/../../../../testwa/start_cp`)
      : fork(`${__dirname}/testwa/start_cp`);
    server.on("message", msg => console);
    this.state = { devices: [] };
  }
  componentWillMount() {
    ipcRenderer.on("devices", (_event, devices) => {
      this.setState({ devices: devices });
    });
  }
  async openDeviceWindow() {
    // 本地端口转发
    // @ts-ignore
    client.forward(this.id, "tcp:1717", "localabstract:minicap");
    // @ts-ignore
    client.forward(this.id, "tcp:1718", "localabstract:minitouch");
    // @ts-ignore
    const [width, height] = this.screen.split("x");
    let sessionWin = new remote.BrowserWindow({
      // frame: false,
      // center: true,
      height: height * 2,
      // width: width,
      // resizable: false,
      // transparent: true,
      title: "脚本录制"
      // titleBarStyle: "hiddenInset"
    });
    if (remote.process.defaultApp) {
      sessionWin.webContents.openDevTools();
      sessionWin.loadURL(
        `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?device=${
          // @ts-ignore
          this.id
        }`
      );
    } else {
      sessionWin.loadURL(
        `file://${require("path").join(__dirname, "index.html")}?device=${
          // @ts-ignore
          this.id
        }`
      );
    }
    sessionWin.show();
  }
  render() {
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
          {device.brand} {device.type}
          <br />
          {device.model}
          <br />
          Android {device.release} SDK {device.sdk}
          <br />
          {device.screen}
          <br />
          <Button onClick={this.openDeviceWindow.bind(device)}>开始</Button>
        </div>
      </div>
    ));
  }
}
export default App;
