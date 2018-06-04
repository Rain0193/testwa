import React, { Component } from "react";
import { Card, Select, Icon } from "antd";
// @ts-ignore
import InspectorStyles from "./Inspector.css";
import frameworks from "./client-frameworks";
import { highlight } from "highlight.js";

const Option = Select.Option;
export default class RecordedActions extends Component {
  constructor(props) {
    super(props);
    this.state = { actionFramework: "json" };
  }
  code(raw = true) {
    let { recordedActions } = this.props;
    if (this.state.actionFramework === "json")
      return JSON.stringify(recordedActions);
    let framework = new frameworks[this.state.actionFramework]();
    framework.actions = recordedActions;
    let rawCode = framework.getCodeString();
    if (raw) {
      return rawCode;
    }
    return highlight(framework.language, rawCode, true).value;
  }

  actionBar() {
    let frameworkOpts = Object.keys(frameworks).map(f => (
      <Option key={f} value={f}>
        {frameworks[f].readableName || "JSON"}
      </Option>
    ));

    return (
      <div>
        <Select
          defaultValue={this.state.actionFramework}
          // @ts-ignore
          onChange={actionFramework => this.setState({ actionFramework })}
          className={InspectorStyles["framework-dropdown"]}
        >
          {frameworkOpts}
        </Select>
      </div>
    );
  }

  render() {
    const highlightedCode = this.code(false);

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
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </Card>
    );
  }
}
