import React, { Component } from "react";
import ReactDOM from 'react-dom';
// import Screen from "./screen";
import { onMouseDown, onMouseUp, onMove, onMoveOut, onHome, onMenu, onBack } from './touch'
export default class App extends Component {
  constructor() {
    // @ts-ignore
    super();
    this.state = {
      node: null,
      tree: null,
      xpath_lite: null,
      xpath: null,
      focusBounds: null,
      treeViewPortWidth: null,
      devices: []
    };
  }
  async componentWillMount() {
  }
  async componentDidMount() {

    require('common/adb').getConnectedDevices(this)
    const canvas = ReactDOM.findDOMNode(this.refs.canvas)
    const g = canvas.getContext('2d')

    canvas.addEventListener("mousedown", (evt) => { onMouseDown(this.getMousePos(evt)) }, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mousemove", (evt) => { onMove(this.getMousePos(evt)) }, false);
    canvas.addEventListener("mouseout", onMoveOut, false)
    require('common/minicap').read((data) => {
      var blob = new Blob([data], { type: 'image/jpeg' })
      // @ts-ignore
      var URL = window.URL || window.webkitURL
      var img = new Image()
      img.onload = function () {
        console.log(img.width, img.height)
        canvas.width = img.width
        canvas.height = img.height
        g.drawImage(img, 0, 0)
        img.onload = null
        img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
        img = null
        blob = null
      }
      img.src = URL.createObjectURL(blob)
    })
  }
  getMousePos(evt) {
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
            <canvas ref="canvas"
            />
            <div onClick={onHome}>home</div>
            <div onClick={onBack}>back</div>
            <div onClick={onMenu}>menu</div>
          </div>
        </div>
      </div>
    );
  }
}
