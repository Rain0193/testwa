import React, { Component } from "react";
import ReactDOM from "react-dom";
import syncScreen from "./minicap";
import MiniTouch from "./minitouch";

class App extends Component {
  constructor() {
    // @ts-ignore
    super();
    this.minitouch = new MiniTouch();
  }
  componentDidMount() {
    import("./appium_client");
    const canvas = ReactDOM.findDOMNode(this.refs.canvas);
    syncScreen(canvas);
    canvas.addEventListener(
      "mousedown",
      evt =>
        this.minitouch.onMouseDown.bind(this.minitouch)(this.getMousePos(evt)),
      false
    );
    canvas.addEventListener(
      "mouseup",
      this.minitouch.onMouseUp.bind(this.minitouch),
      false
    );
    canvas.addEventListener(
      "mousemove",
      evt => this.minitouch.onMove.bind(this.minitouch)(this.getMousePos(evt)),
      false
    );
    canvas.addEventListener(
      "mouseout",
      this.minitouch.onMoveOut.bind(this.minitouch),
      false
    );
  }
  getMousePos(evt) {
    // @ts-ignore
    const rect = ReactDOM.findDOMNode(this.refs.canvas).getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) * 2,
      y: (evt.clientY - rect.top) * 2
    };
  }
  render() {
    return (
      <div className="container">
        <canvas ref="canvas" />
        <div onClick={this.minitouch.onHome.bind(this.minitouch)}>home</div>
        <div onClick={this.minitouch.onBack.bind(this.minitouch)}>back</div>
        <div onClick={this.minitouch.onMenu.bind(this.minitouch)}>menu</div>
      </div>
    );
  }
}
export default App;
