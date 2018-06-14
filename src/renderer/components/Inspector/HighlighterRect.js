console.log("UI布局高亮方法模块");
import React from "react";
import { getRecordedActions, parseCoordinates, emitter } from "./lib";
// @ts-ignore
import InspectorCSS from "./Inspector.css";
import { ipcRenderer } from "electron";
export default ({ selectedElement, element, zIndex }) => {
  const { x1, y1, x2, y2 } = parseCoordinates(element);
  let left = x1 / 2;
  let top = y1 / 2;
  let width = (x2 - x1) / 2;
  let height = (y2 - y1) / 2;
  let timer;
  return (
    <div
      className={
        selectedElement.path === element.path
          ? "highlighter-box hovered-element-box"
          : "highlighter-box"
      }
      onClick={() => {
        const { variableName, strategy, selector } = getRecordedActions(
          element
        );
        console.log("请求添加操作行为");
        ipcRenderer.send("recordedActions", [
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
        timer = setTimeout(() => {
          console.log("请求设置选中元素");
          emitter.emit("selectedElement", element);
          const expandedPaths = [];
          const pathArr = element.path
            .split(".")
            .slice(0, element.path.length - 1);
          while (pathArr.length > 1) {
            pathArr.splice(pathArr.length - 1);
            let path = pathArr.join(".");
            expandedPaths.push(path);
          }
          console.log("请求设置展开元素");
          emitter.emit("expandedPaths", expandedPaths);
        }, 300);
      }}
      onMouseOut={() => {
        clearTimeout(timer);
        timer = null;
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
};
