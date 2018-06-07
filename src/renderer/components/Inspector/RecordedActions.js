console.log("操作行为组件模块");
import React, { Component } from "react";
import { Card, Select, Icon } from "antd";
import { highlight } from "highlight.js";
import frameworks from "./client-frameworks";
import { emitter } from "./lib";
// @ts-ignore
import InspectorStyles from "./Inspector.css";
const Option = Select.Option;
export default class extends Component {
  constructor(props) {
    console.log("操作行为组件实例化");
    super(props);
    this.state = { actionFramework: "json", recordedActions: [] };
    emitter.on("recordedActions", recordedActions => {
      console.log("得到操作行为，更新state");
      this.setState({
        recordedActions: [...this.state.recordedActions, ...recordedActions]
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
  actionBar() {
    console.log("生成语言菜单项");
    return (
      <div>
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
        <div
          className={InspectorStyles["recorded-code"]}
          dangerouslySetInnerHTML={{ __html: this.code() }}
        />
        {console.log("操作行为组件内容")}
      </Card>
    );
  }
}
