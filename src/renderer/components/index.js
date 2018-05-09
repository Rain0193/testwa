import React, { Component } from "react";
import ReactDOM from "react-dom";
// @ts-ignore
import parse from "common/minicap";
import {
  onMouseDown,
  onMouseUp,
  onMove,
  onMoveOut,
  onHome,
  onMenu,
  onBack
} from "./touch";
export default class App extends Component {
  constructor() {
    // @ts-ignore
    super();
    this.state = {};
  }
  async componentDidMount() {
    // @ts-ignore
    require("common/adb").trackDevices(this);
    const canvas = ReactDOM.findDOMNode(this.refs.canvas);
    canvas.addEventListener(
      "mousedown",
      evt => onMouseDown(this.getMousePos(evt)),
      false
    );
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener(
      "mousemove",
      evt => onMove(this.getMousePos(evt)),
      false
    );
    canvas.addEventListener("mouseout", onMoveOut, false);
    // @ts-ignore
    const g = canvas.getContext("2d");

    parse(data => {
      const img = new Image();
      img.onload = () => {
        console.log(img.width, img.height);
        // @ts-ignore
        canvas.width = img.width;
        // @ts-ignore
        canvas.height = img.height;
        g.drawImage(img, 0, 0);
      };
      img.src = "data:image/png;base64," + Buffer.from(data).toString("base64");
    });
  }
  getMousePos(evt) {
    // @ts-ignore
    const rect = ReactDOM.findDOMNode(this.refs.canvas).getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
  render() {
    return (
      <div className="container">
        <div className="main">
          <div className="flex-col">
            <canvas ref="canvas" />
            <div onClick={onHome}>home</div>
            <div onClick={onBack}>back</div>
            <div onClick={onMenu}>menu</div>
            {console.log(this.state.devices)}
          </div>
        </div>
      </div>
    );
  }
}
