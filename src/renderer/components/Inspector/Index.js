import { ipcRenderer } from "electron";
import React, { Component } from "react";
import Screenshot from "./Screenshot";
import Source from "./Source";
import RecordedActions from "./RecordedActions";
import "antd/dist/antd.css";
// @ts-ignore
import InspectorStyles from "./Inspector.css";

export default class Inspector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedElement: {},
      expandedPaths: ["0"],
      recordedActions: []
    };
    ipcRenderer.on("expandedPaths", (_, { expandedPaths }) => {
      this.setState({ expandedPaths });
    });
  }
  setExpandedPaths(expandedPaths) {
    this.setState({ expandedPaths });
  }
  setSelectedElement(selectedElement) {
    this.setState({ selectedElement });
  }
  addRecordedActions(recordedActions) {
    this.setState({
      recordedActions: [...this.state.recordedActions, ...recordedActions]
    });
  }

  render() {
    return (
      <div className={InspectorStyles["inspector-container"]}>
        <div className={InspectorStyles["inspector-main"]}>
          <div
            style={{ float: "left" }}
            id="screenshotContainer"
            className={InspectorStyles["screenshot-container"]}
          >
            <Screenshot
              selectedElement={this.state.selectedElement}
              addRecordedActions={this.addRecordedActions.bind(this)}
              setExpandedPaths={this.setExpandedPaths.bind(this)}
              setSelectedElement={this.setSelectedElement.bind(this)}
            />
          </div>
          <div
            className={InspectorStyles["source-tree-container"]}
            style={{ float: "left" }}
          >
            <RecordedActions {...this.state} />
            <Source
              setExpandedPaths={this.setExpandedPaths.bind(this)}
              expandedPaths={this.state.expandedPaths}
              selectedElement={this.state.selectedElement}
            />
          </div>
        </div>
      </div>
    );
  }
}
