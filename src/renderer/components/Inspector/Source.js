console.log("ui树组件模块");
import React, { Component } from "react";
import { Card, Icon, Tree } from "antd";
import { emitter, xmlToJSON } from "./lib";
// @ts-ignore
import InspectorStyles from "./Inspector.css";
const { TreeNode } = Tree;

export default class extends Component {
  constructor(props) {
    console.log("ui树组件实例化");
    super(props);
    this.state = { selectedElement: {} };
    emitter.on("selectedElement", selectedElement => {
      console.log("得到当前选中元素，更新state");
      this.setState({ selectedElement });
    });
    emitter.on("sourceXML", sourceXML => {
      console.log("得到XML，更新state");
      this.setState({ sourceXML });
    });
    emitter.on("expandedPaths", expandedPaths => {
      console.log("得到展开元素，更新state");
      this.setState({ expandedPaths });
    });
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
    ])
      if (attributes[attr])
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
    return (
      <span>
        &lt;<b className={InspectorStyles.sourceTag}>{tagName}</b>
        {attrs}&gt;
      </span>
    );
  }
  render() {
    console.log("ui树组件渲染");
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
                autoExpandParent={false}
                expandedKeys={this.state.expandedPaths}
                selectedKeys={[this.state.selectedElement.path]}
                onExpand={expandedPaths => {
                  emitter.emit("expandedPaths", expandedPaths);
                }}
                onSelect={selectedPaths =>
                  console.log("选中元素", selectedPaths)
                }
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
