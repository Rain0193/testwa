console.log("屏幕同步组件模块");
import React, { Component } from "react";
import { Layout, Icon, Button, Tabs } from "antd";
import { BannerParser } from "minicap";
import HighlighterRect from "./HighlighterRect";
import { xmlToJSON, request, emitter } from "./lib";
import adbkit from "adbkit";
// @ts-ignore
import styles from "./Inspector.css";
export const client = adbkit.createClient();

export default class extends Component {
  constructor(props) {
    console.log("屏幕同步组件实例化");
    super(props);
    this.state = { selectedElement: {} };
    this.canvas = null;
    this.minitouch = require("net").connect({ port: 1718 });
    this.minicap = require("net").connect({ port: 1717 });
    console.log("请求获取XML");
    setTimeout(
      () =>
        request.get("/source", (_err, _res, body) => {
          console.log("已获取XML，请求更新 state");
          this.setState({ sourceXML: body.value });
          emitter.emit("sourceXML", body.value);
        }),
      1000
    );
    emitter.on("selectedElement", selectedElement => {
      console.log("得到选中元素，更新state");
      this.setState({ selectedElement });
    });
  }
  onMouseDown(evt) {
    this.isPressing = true;
    this.minitouch.write(
      // `d 0 ${evt.nativeEvent.offsetX * 2} ${evt.nativeEvent.offsetY * 2} 50\n`
      `d 0 ${evt.clientX * 2} ${evt.clientY * 2} 50\n`
    );
    this.minitouch.write("c\n");
  }
  onMouseUp() {
    this.isPressing = false;
    this.minitouch.write("u 0\n");
    this.minitouch.write("c\n");
    setTimeout(() => {
      console.log("请求获取XML");
      request.get("/source", (_err, _res, body) => {
        console.log("已获取XML，请求更新 state");
        this.setState({ sourceXML: body.value });
        emitter.emit("sourceXML", body.value);
      });
    }, 2000);
  }
  onMouseMove(evt) {
    if (!this.isPressing) return;
    this.minitouch.write(
      // `m 0 ${evt.nativeEvent.offsetX * 2} ${evt.nativeEvent.offsetY * 2}  50\n`
      `m 0 ${evt.clientX * 2} ${evt.clientY * 2} 50\n`
    );
    this.minitouch.write("c\n");
  }
  componentDidMount() {
    console.log("同步屏幕");
    let banner = null;
    let data = [];
    const g = this.canvas.getContext("2d");
    this.minicap.on("data", chunk => {
      // @ts-ignore
      data.push(...chunk);
      if (banner === null) {
        const parser = new BannerParser();
        parser.parse(data.splice(0, 24));
        banner = parser.take();
      } else {
        const arr = data.slice(0, 4);
        const size =
          (arr[3] << 24) | (arr[2] << 16) | (arr[1] << 8) | (arr[0] << 0);
        if (data.length >= size + 4) {
          const chunk = data.slice(4, 4 + size);
          const img = new Image();
          img.onload = () => {
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            g.drawImage(img, 0, 0);
          };
          img.src =
            "data:image/png;base64," + Buffer.from(chunk).toString("base64");
          data = data.slice(4 + size);
        }
      }
    });
  }

  highlighterRects() {
    console.log("更新屏幕ui高亮布局");
    const highlighterRects = [];
    let recursive = (element, zIndex = 0) => {
      highlighterRects.push(
        <HighlighterRect
          selectedElement={this.state.selectedElement}
          element={element}
          zIndex={zIndex}
          key={element.path}
        />
      );
      for (let childEl of element.children) recursive(childEl, zIndex + 1);
    };
    this.state.sourceXML && recursive(xmlToJSON(this.state.sourceXML));
    return highlighterRects;
  }
  render() {
    console.log("屏幕组件渲染");
    return (
      <div className={styles.innerScreenshotContainer}>
        <div
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
          onMouseMove={this.onMouseMove.bind(this)}
          onMouseOut={() => (this.isPressing = false)}
        >
          {console.log("屏幕画面")}
          <canvas ref={canvas => (this.canvas = canvas)} />
          {this.highlighterRects()}
        </div>
        <Button
          onClick={() =>
            client.shell(this.props.device, 'input keyevent "KEYCODE_MENU"')
          }
        >
          菜单
        </Button>
        <Button
          onClick={() =>
            client.shell(this.props.device, 'input keyevent "KEYCODE_HOME"')
          }
        >
          主屏
        </Button>
        <Button
          onClick={() =>
            client.shell(this.props.device, 'input keyevent "KEYCODE_BACK"')
          }
        >
          返回
        </Button>
      </div>
    );
  }
}
