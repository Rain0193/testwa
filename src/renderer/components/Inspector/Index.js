console.log("录制组件人口模块");
import React from "react";
import Screenshot from "./Screenshot";
import Source from "./Source";
// @ts-ignore
import InspectorStyles from "./Inspector.css";

export default props => (
  <div className={InspectorStyles["inspector-container"]}>
    <div className={InspectorStyles["inspector-main"]}>
      <div
        style={{ float: "left" }}
        id="screenshotContainer"
        className={InspectorStyles["screenshot-container"]}
      >
        <Screenshot device={props.device} />
      </div>
      <div
        className={InspectorStyles["source-tree-container"]}
        style={{ float: "left" }}
      >
        <Source />
      </div>
      {console.log("录制组件内容")}
    </div>
  </div>
);
