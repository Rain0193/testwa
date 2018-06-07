console.log("录制组件人口模块");
import React from "react";
import Screenshot from "./Screenshot";
import Source from "./Source";
import RecordedActions from "./RecordedActions";
import "antd/dist/antd.css";
// @ts-ignore
import InspectorStyles from "./Inspector.css";

export default () => (
  <div className={InspectorStyles["inspector-container"]}>
    <div className={InspectorStyles["inspector-main"]}>
      <div
        style={{ float: "left" }}
        id="screenshotContainer"
        className={InspectorStyles["screenshot-container"]}
      >
        <Screenshot />
      </div>
      <div
        className={InspectorStyles["source-tree-container"]}
        style={{ float: "left" }}
      >
        <RecordedActions />
        <Source />
      </div>
      {console.log("录制组件内容")}
    </div>
  </div>
);
