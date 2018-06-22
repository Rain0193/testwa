console.log("操作行为组件模块");
import React, { Component } from "react";
import { Card, Select, Icon, Button, Table } from "antd";
import { highlight } from "highlight.js";
import frameworks from "./client-frameworks";
import { emitter } from "../Inspector/lib";
import { fork } from "child_process";
var PouchDB = require("pouchdb-browser");
var db = new PouchDB("code");
// @ts-ignore
import InspectorStyles from "./Inspector.css";
import { ipcRenderer } from "electron";
const Option = Select.Option;

export default class extends Component {
  constructor(props) {
    console.log("操作行为组件实例化");
    super(props);
    this.state = { actionFramework: "json", recordedActions: [] };
    ipcRenderer.on("recordedActions", (_, recordedActions) => {
      console.log("得到操作行为，更新state", recordedActions);
      this.setState({
        recordedActions: [...this.state.recordedActions, ...recordedActions]
      });
    });
  }
  componentDidMount() {
    if (this.props.code) {
      console.log(this.props.code, "in record");
      this.setState({
        recordedActions: this.props.code.value
      });
    }
    emitter.on("code", code => {
      console.log(code, "in record");
      this.setState({
        recordedActions: code.value
      });
    });
  }
  code() {
    console.log("脚本代码生成");
    let { recordedActions } = this.state;
    if (this.state.actionFramework === "json")
      return JSON.stringify(recordedActions);
    let framework = new frameworks[this.state.actionFramework]();
    framework.actions = recordedActions;
    let rawCode = framework.getCodeString();
    return highlight(framework.language, rawCode, true).value;
  }
  runCode() {
    let framework = new frameworks["jsWd"]();
    framework.caps = {
      platformName: "Android",
      deviceName: this.props.device.id,
      appPackage: this.props.device.packageName,
      appActivity: this.props.device.activityName
    };
    framework.actions = this.state.recordedActions;
    let rawCode = framework.getCodeString(true);
    require("fs").writeFile("code.js", rawCode, () => fork("code.js"));
  }
  saveCode() {
    console.log("saveCode");
    if (this.props.code) {
      this.props.code.value = this.state.recordedActions;
      db.put(this.props.code);
    } else {
      db.post({
        name: this.props.device.appName,
        value: this.state.recordedActions
      });
    }
    this.setState({ recordedActions: [] });
    this.props.finishRecord("device");
    // this.state.recordedActions.map(code => {
    //   // code.params = JSON.stringify(code.params);
    //   code._id = new Date().toISOString();
    //   db.put(code, console.log);
    // });
  }
  removeCode() {
    db.remove(this.props.code);
    this.setState({ recordedActions: [] });
    this.props.finishRecord("device");
  }
  actionBar() {
    console.log("生成语言菜单项");
    return (
      <div>
        <Button onClick={this.runCode.bind(this)}>回放</Button>
        <Button onClick={this.saveCode.bind(this)}>保存</Button>
        <Button onClick={this.removeCode.bind(this)}>删除</Button>
        <Select
          defaultValue="json"
          // @ts-ignore
          onChange={actionFramework => this.setState({ actionFramework })}
          className={InspectorStyles["framework-dropdown"]}
        >
          {Object.keys(frameworks).map(f => (
            <Option key={f} value={f}>
              {frameworks[f].readableName || "JSON"}
              {console.log("语言菜单项", frameworks[f].readableName || "JSON")}
            </Option>
          ))}
        </Select>
      </div>
    );
  }
  render() {
    console.log("操作行为组件渲染");
    return (
      <Card
        title={
          <span>
            <Icon type="code-o" /> 脚本
          </span>
        }
        className={InspectorStyles["recorded-actions"]}
        extra={this.actionBar()}
      >
        {console.log(this.state.recordedActions, "table")}
        {this.state.actionFramework === "json" ? (
          <Table
            columns={[
              {
                title: "操作",
                dataIndex: "action",
                key: "action"
              },
              {
                title: "参数",
                dataIndex: "params",
                key: "params"
              }
            ]}
            dataSource={this.state.recordedActions}
          />
        ) : (
          <div
            className={InspectorStyles["recorded-code"]}
            dangerouslySetInnerHTML={{ __html: this.code() }}
          />
        )}
        {console.log("操作行为组件内容")}
      </Card>
    );
  }
}
