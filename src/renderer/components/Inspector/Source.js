import React, { Component } from "react";
import { Tree } from "antd";
// @ts-ignore
import InspectorStyles from "./Inspector.css";
import { Card, Icon } from "antd";
import { request, xmlToJSON } from "./lib";

const { TreeNode } = Tree;

export default class Source extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    // request.get("/source", (_err, _res, body) => {
    //   this.setState({ sourceXML: body.value });
    // });
  }
  getFormattedTag(el) {
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
    const { selectedElement } = this.props;
    const { path } = selectedElement;
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
          {this.props.sourceXML && (
            <Tree
              onExpand={this.props.setExpandedPaths}
              autoExpandParent={false}
              expandedKeys={this.props.expandedPaths}
              onSelect={selectedPaths => {}}
              selectedKeys={[path]}
            >
              {recursive(xmlToJSON(this.props.sourceXML))}
            </Tree>
          )}
        </div>
      </Card>
    );
  }
}
