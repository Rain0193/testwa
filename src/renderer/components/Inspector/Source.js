import React, { Component } from "react";
import { Tree } from "antd";
// @ts-ignore
import InspectorStyles from "./Inspector.css";
import { Card, Icon } from "antd";
import { emitter, xmlToJSON } from "./lib";
console.log("ui树方法模块");
const { TreeNode } = Tree;

export default class extends Component {
  constructor(props) {
    console.log("ui树方法调用");
    super(props);
    this.state = { selectedElement: {} };
    emitter.on("selectedElement", selectedElement =>
      this.setState({ selectedElement })
    );
    emitter.on("sourceXML", sourceXML => this.setState({ sourceXML }));
    emitter.on("expandedPaths", expandedPaths =>
      this.setState({ expandedPaths })
    );
  }
  getFormattedTag(el) {
    console.log("获取ui树节点标题");
    const { tagName, attributes } = el;
    let attrs = [];
    for (let attr of [
      "name",
      "content-desc",
      "resource-id",
      "AXDescription",
      "AXIdentifier"
    ]) {
      if (attributes[attr]) {
        attrs.push(
          <span key={attr}>
            &nbsp;
            <i className={InspectorStyles.sourceAttrName}>{attr}</i>=<span
              className={InspectorStyles.sourceAttrValue}
            >
              &quot;{attributes[attr]}&quot;
            </span>
          </span>
        );
      }
    }
    return (
      <span>
        &lt;<b className={InspectorStyles.sourceTag}>{tagName}</b>
        {attrs}&gt;
      </span>
    );
  }
  render() {
    let recursive = elemObj =>
      elemObj.children.map(el => (
        <TreeNode title={this.getFormattedTag(el)} key={el.path}>
          {recursive(el)}
        </TreeNode>
      ));
    return (
      <Card
        title={
          <span>
            <Icon type="file-text" /> UI树
          </span>
        }
        className={InspectorStyles["source-tree-card"]}
      >
        <div id="sourceContainer" className={InspectorStyles["tree-container"]}>
          {this.state.sourceXML &&
            this.state.selectedElement && (
              <Tree
                onExpand={expandedPaths => {
                  emitter.emit("expandedPaths", expandedPaths);
                }}
                autoExpandParent={false}
                expandedKeys={this.state.expandedPaths}
                onSelect={selectedPaths =>
                  console.log("选中元素", selectedPaths)
                }
                selectedKeys={[this.state.selectedElement.path]}
              >
                {recursive(xmlToJSON(this.state.sourceXML))}
                {console.log("ui树内容")}
              </Tree>
            )}
        </div>
      </Card>
    );
  }
}
