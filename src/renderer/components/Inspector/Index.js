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
              addRecordedActions={recordedActions =>
                this.setState({
                  recordedActions: [
                    ...this.state.recordedActions,
                    ...recordedActions
                  ]
                })
              }
              setExpandedPaths={expandedPaths =>
                this.setState({ expandedPaths })
              }
              setSelectedElement={selectedElement =>
                this.setState({ selectedElement })
              }
              setSourceXML={sourceXML => this.setState({ sourceXML })}
              sourceXML={this.state.sourceXML}
            />
          </div>
          <div
            className={InspectorStyles["source-tree-container"]}
            style={{ float: "left" }}
          >
            <RecordedActions {...this.state} />
            <Source
              setExpandedPaths={expandedPaths =>
                this.setState({ expandedPaths })
              }
              expandedPaths={this.state.expandedPaths}
              selectedElement={this.state.selectedElement}
              sourceXML={this.state.sourceXML}
            />
          </div>
        </div>
      </div>
    );
  }
}
