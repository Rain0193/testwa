console.log("设备列表组件入口模块");
import React, { Component } from "react";
import { ipcRenderer, remote } from "electron";
import { Layout, Icon, Button, Tabs } from "antd";
const TabPane = Tabs.TabPane;
const { Header, Footer, Sider, Content } = Layout;
import { Subject } from "rxjs";
import { map, takeUntil, concatAll, withLatestFrom } from "rxjs/operators";
import "./devices.layout.css";
export default class extends Component {
  constructor(props) {
    console.log("设备列表组件实例化");
    super(props);
    this.state = {
      devices: [],
      terminalDisplay: true,
      sideWidth: 0,
      terminalHeight: 0
    };
    this.terminalSwitch = this.terminalSwitch.bind(this);
    console.log("请求获取设备列表信息");
    ipcRenderer.send("devices"); // dev
    ipcRenderer.on("devices", (_event, devices) => {
      console.log("得到设备信息，修改state");
      this.setState({ devices });
    });
  }

  componentDidMount() {
    const side = document.getElementsByClassName("main-layout-sider")[0];
    const sideDrag = document.getElementsByClassName(
      "side-custom-tabs-tabpane-content-drag"
    )[0];
    const sideMouseDown = new Subject();
    const sideMouseMove = new Subject();
    const sideMouseUp = new Subject();

    const ter = document.getElementsByClassName("main-terminal")[0];
    const terDrag = document.getElementsByClassName(
      "main-terminal-drag-line"
    )[0];
    const terMouseDown = new Subject();
    const terMouseMove = new Subject();
    const terMouseUp = new Subject();

    sideDrag.addEventListener("mousedown", event => {
      sideMouseDown.next(event);
    });
    document.body.addEventListener("mousemove", event => {
      sideMouseMove.next(event);
    });
    document.body.addEventListener("mouseup", event => {
      sideMouseUp.next(event);
    });

    terDrag.addEventListener("mousedown", event => {
      terMouseDown.next(event);
    });
    document.body.addEventListener("mousemove", event => {
      terMouseMove.next(event);
    });
    document.body.addEventListener("mouseup", event => {
      terMouseUp.next(event);
    });

    sideMouseDown
      .pipe(
        map(
          event =>
            event.preventDefault()
              ? event.preventDefault()
              : (event.returnValue = false)
        ),
        map(event => sideMouseMove.pipe(takeUntil(sideMouseUp))),
        concatAll(),
        map(event => event.clientX),
        withLatestFrom(sideMouseDown, (move, down) => {
          return move - down.offsetX + 16;
        })
      )
      .subscribe(event => {
        this.setState({ sideWidth: event });
        side.style.flex = "0 0 " + this.state.sideWidth + "px";
      });

    terMouseDown
      .pipe(
        map(
          event =>
            event.preventDefault()
              ? event.preventDefault()
              : (event.returnValue = false)
        ),
        map(event => terMouseMove.pipe(takeUntil(terMouseUp))),
        concatAll(),
        map(event => event.clientY),
        withLatestFrom(terMouseDown, (move, down) => {
          return move - down.offsetY;
        })
      )
      .subscribe(event => {
        this.setState({
          terminalHeight: ter.getBoundingClientRect().bottom - event
        });
        ter.style.height = this.state.terminalHeight + "px";
      });
  }

  terminalSwitch() {
    this.setState({ terminalDisplay: !this.state.terminalDisplay });
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
  devices() {
    console.log("设备列表组件渲染");
    return this.state.devices.map(device => (
      <div key={device.id}>
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
    ));
  }

  render() {
    return (
      <div className={"devices-wrap"}>
        <Layout className={"main-layout"}>
          <Header className={"main-layout-header"}>
            <Icon type="appstore-o" className={"main-header-logo"} />
            <p className="main-header-brand">Testwa录制平台</p>
            <Button icon="file-add" size={"small"}>
              新建
            </Button>
            <Button icon="play-circle" size={"small"}>
              录制
            </Button>
            <Button icon="pause" size={"small"}>
              暂停
            </Button>
          </Header>
          <Layout className={"main-first-layout"}>
            <Sider className="main-layout-sider">
              <Tabs
                tabPosition={"left"}
                defaultActiveKey="1"
                className={"side-custom-tabs"}
              >
                <TabPane tab="脚本列表" key="1">
                  <div className="side-custom-tabs-wrap">
                    <div className="side-custom-tabs-tabpane-header">
                      <Icon type="folder-add" />
                      <Icon type="file-add" />
                      <Icon type="delete" />
                    </div>
                    <div className="side-custom-tabs-tabpane-content">
                      <div className="side-custom-tabs-tabpane-content-list" />
                    </div>
                  </div>
                </TabPane>
                <TabPane tab="应用列表" key="2">
                  <div className="side-custom-tabs-wrap">
                    <div className="side-custom-tabs-tabpane-header">
                      <Icon type="plus" />
                      <Icon type="download" />
                      <Icon type="delete" />
                    </div>
                    <div className="side-custom-tabs-tabpane-content">
                      <div className="side-custom-tabs-tabpane-content-list" />
                    </div>
                  </div>
                </TabPane>
              </Tabs>
              <div className="side-custom-tabs-tabpane-content-drag-wrap">
                <div className="side-custom-tabs-tabpane-content-drag">
                  <Icon type="ellipsis" />
                </div>
              </div>
            </Sider>
            <Content className={"main-layout-content"}>
              <Layout className={"main-content-layout"}>
                <div className="main-content-layout-wrap">
                  <div className="main-business-wrap">
                    <Tabs type="card" className="main-common-tabs">
                      <TabPane tab="设备列表" key="device">
                        设备列表
                        {this.devices()}
                      </TabPane>
                      <TabPane tab="录制引导" key="guide">
                        录制引导
                      </TabPane>
                      <TabPane tab="步骤录制" key="Recording">
                        步骤录制
                      </TabPane>
                    </Tabs>
                  </div>
                  <div
                    className={
                      this.state.terminalDisplay
                        ? "main-terminal"
                        : "main-terminal-wrap-hide main-terminal"
                    }
                  >
                    <div className="main-terminal-drag-line" />
                    <div className="main-terminal-control-bar">
                      <Icon type="to-top" onClick={this.terminalSwitch} />
                    </div>
                    <Tabs type="card" className="main-common-tabs">
                      <TabPane
                        tab="Terminal"
                        key="log"
                        className="main-terminal-area"
                      >
                        log area
                      </TabPane>
                    </Tabs>
                  </div>
                </div>
              </Layout>
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}
