console.log("设备列表组件入口模块");
import React, { Component } from "react";
import { ipcRenderer, remote } from "electron";
import { Layout, Icon, Button, Tabs, Card, Tree } from "antd";
const TabPane = Tabs.TabPane;
const { Header, Footer, Sider, Content } = Layout;
import { Subject } from "rxjs";
import { map, takeUntil, concatAll, withLatestFrom } from "rxjs/operators";
import "./devices.layout.css";
import { request, emitter } from "../Inspector/lib";
import adbkit from "adbkit";
import Guide from "./guide";
import RecordedActions from "./RecordedActions";
const PouchDB = require("pouchdb-browser");
const db = new PouchDB("code");

export const client = adbkit.createClient();
export default class extends Component {
  constructor(props) {
    console.log("设备列表组件实例化");
    super(props);
    this.state = {
      activeKey: "device",
      packages: [],
      devices: [],
      codes: [],
      terminalDisplay: false,
      sideWidth: 0,
      terminalHeight: 0
    };
    db.changes({
      since: "now",
      live: true,
      include_docs: true
    }).on("change", () => {
      db.allDocs({ include_docs: true, descending: true }).then(({ rows }) => {
        const codes = rows.map(({ doc }) => doc);
        this.setState({ codes });
      });
    });
    db.allDocs({ include_docs: true, descending: true }).then(({ rows }) => {
      const codes = rows.map(({ doc }) => doc);
      this.setState({ codes });
    });
    this.device = {};
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
  showCode() {
    console.log(this.state.codes, "shouCode");
    return (
      <Tree.TreeNode title="脚本" key="0">
        {this.state.codes.map(code => (
          <Tree.TreeNode
            title={
              code.info ? code.info.appName : "旧版数据不兼容，请清空indexedDB"
            }
            key={code._id}
          />
        ))}
      </Tree.TreeNode>
    );
  }
  onSelectCode([id]) {
    if (id)
      db.get(id).then(code => {
        console.log(code);
        this.setState({ code });
        emitter.emit("code", code);
        // ipcRenderer.send("recordedActions", [code.value]); // dev
        this.setState({ activeKey: "Recording" });
      });
  }
  openDeviceWindow(device) {
    // @ts-ignore
    const [width, height] = device.screen.split("x");
    console.log("创建录制窗口进程");
    let sessionWin = (this.sessionWin = new remote.BrowserWindow({
      // frame: false,
      // center: true,
      // height: height * 2,
      // width: width,
      // resizable: false,
      // transparent: true,
      title: "脚本录制"
      // titleBarStyle: "hiddenInset"
    }));
    if (remote.process.defaultApp) {
      console.log("开发环境");
      sessionWin.loadURL(
        `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?device=${
          // @ts-ignore
          device.id
          // @ts-ignore
        }&width=${width}`
      );
      sessionWin.webContents.openDevTools();
    } else {
      console.log("生产环境");
      sessionWin.loadURL(
        // @ts-ignore
        `file://${__dirname}/index.html?device=${device.id}&width=${width}`
      );
    }
    sessionWin.maximize();
    sessionWin.show();
  }
  toDevice(device) {
    // @ts-ignore
    console.log("请求本地端口转发到", device.id);
    // @ts-ignore
    ipcRenderer.send("forward", device.id);
    console.log("请求获取设备应用列表");
    request.get("/package/all", (_err, _res, body) => {
      console.log(_err, _res, body);
      console.log("得到应用列表,请求更新 state", body.value);
      this.setState({ packages: JSON.parse(body.value) });
    });
    this.setState({ activeKey: "guide" });
    this.device = device;
  }
  devices() {
    console.log("设备列表组件渲染");
    return this.state.devices.map(device => (
      <Card
        key={device.id}
        title={device.brand || device.id}
        extra={
          device.type !== "offline" ? (
            <a onClick={() => this.toDevice(device)}>开始</a>
          ) : (
            device.type
          )
        }
        style={{ width: 300 }}
      >
        {device.type !== "offline" ? (
          <div>
            <p>{device.model}</p>
            <p>
              Android {device.release} SDK {device.sdk}
            </p>
            <p>{device.screen}</p>
          </div>
        ) : (
          <div>设备已离线，请重新打开USB调试</div>
        )}
        {console.log(device.id, "渲染")}
      </Card>
    ));
  }
  handleChange([packageName, activityName, appName]) {
    // const desired = {
    //   platformName: "Android",
    //   deviceName: this.device.id,
    //   appPackage: packageName,
    //   appActivity: activityName,
    //   automationName: "UiAutomator2"
    // };
    // driver.init(desired);
    // client.shell(
    //   this.device.id,
    //   `monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`
    // );
    console.log("请求启动", `${packageName}/${activityName}`);
    client.shell(this.device.id, `am start -n ${packageName}/${activityName}`);
    this.device.packageName = packageName;
    this.device.appName = appName;
    this.device.activityName = activityName;
    // this.setState({ packageName });
    this.setState({ activeKey: "Recording" });
    this.openDeviceWindow(this.device);
  }
  render() {
    console.log("首页渲染");
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
                      <div className="side-custom-tabs-tabpane-content-list">
                        <Tree
                          onSelect={this.onSelectCode.bind(this)}
                          defaultExpandedKeys={["0"]}
                        >
                          {this.showCode()}
                        </Tree>
                      </div>
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
                    <Tabs
                      type="card"
                      activeKey={this.state.activeKey}
                      className="main-common-tabs"
                    >
                      <TabPane tab="设备列表" key="device">
                        {this.devices()}
                      </TabPane>
                      <TabPane tab="录制引导" key="guide">
                        <Guide
                          handleChange={this.handleChange.bind(this)}
                          packages={this.state.packages}
                        />
                      </TabPane>
                      <TabPane tab="步骤录制" key="Recording">
                        <RecordedActions
                          code={this.state.code}
                          device={this.device}
                          finishRecord={activeKey => {
                            if (this.sessionWin)
                              try {
                                this.sessionWin.close();
                              } catch (e) {}
                            this.setState({
                              activeKey,
                              code: null
                            });
                          }}
                        />
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
