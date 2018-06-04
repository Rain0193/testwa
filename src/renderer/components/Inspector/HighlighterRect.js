import React, { Component } from "react";
import { ipcRenderer } from "electron";
// import { getLocators } from "../renderer/components/Inspector/shared";

// @ts-ignore
import InspectorCSS from "./Inspector.css";
import { parseCoordinates, getLocators } from "./shared";
import { addRecordedActions } from "./lib";
export default class HighlighterRect extends Component {
  constructor(props) {
    super(props);
    this.timer = null;
    // this.state = {
    //   highlighterClasses: "highlighter-box"
    // };
  }
  render() {
    let { selectedElement = {}, element, zIndex } = this.props;
    const { x1, y1, x2, y2 } = parseCoordinates(element);
    let left = x1 / 2;
    let top = y1 / 2;
    let width = (x2 - x1) / 2;
    let height = (y2 - y1) / 2;
    return (
      <div
        className={
          selectedElement.path === element.path
            ? "highlighter-box hovered-element-box"
            : "highlighter-box"
        }
        onClick={() => {
          const { variableName, strategy, selector } = addRecordedActions(
            element
          );
          this.props.addRecordedActions([
            {
              action: "findAndAssign",
              params: [strategy, selector, variableName]
            },
            {
              action: "click",
              params: [variableName]
            }
          ]);
        }}
        onMouseOver={() => {
          // this.setState({
          //   highlighterClasses: "highlighter-box hovered-element-box"
          // });
          this.timer = setTimeout(() => {
            this.props.setSelectedElement(element);
            const expandedPaths = [];
            const pathArr = element.path
              .split(".")
              .slice(0, element.path.length - 1);
            while (pathArr.length > 1) {
              pathArr.splice(pathArr.length - 1);
              let path = pathArr.join(".");
              expandedPaths.push(path);
            }
            this.props.setExpandedPaths(expandedPaths);
          }, 600);
        }}
        onMouseOut={() => {
          clearTimeout(this.timer);
          // this.setState({
          //   highlighterClasses: "highlighter-box"
          // });
        }}
        key={element.path}
        style={{
          zIndex,
          left: left || 0,
          top: top || 0,
          width: width || 0,
          height: height || 0
        }}
      >
        <div />
      </div>
    );
  }
}
