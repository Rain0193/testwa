import React, { Component } from "react";
// @ts-ignore
import styles from "./Inspector.css";
import { BannerParser } from "minicap";
import Button from "@material-ui/core/Button";
import HighlighterRect from "./HighlighterRect";
import { xmlToJSON, request } from "./lib";
import { emitter } from "./lib";

export default class Screenshot extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedElement: {} };
    this.canvas = null;
    this.minitouch = require("net").connect({ port: 1718 });
    this.minicap = require("net").connect({ port: 1717 });
    request.get("/source", (_err, _res, body) => {
      emitter.emit("sourceXML", body.value);
    });
    emitter.on("sourceXML", sourceXML => this.setState({ sourceXML }));
    emitter.on("selectedElement", selectedElement =>
      this.setState({ selectedElement })
    );
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
      request.get("/source", (_err, _res, body) => {
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
    return (
      <div className={styles.innerScreenshotContainer}>
        <div
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
          onMouseMove={this.onMouseMove.bind(this)}
          onMouseOut={() => (this.isPressing = false)}
        >
          <canvas ref={canvas => (this.canvas = canvas)} />
          {this.highlighterRects()}
        </div>
        <Button>菜单</Button>
        <Button>主屏</Button>
        <Button>返回</Button>
      </div>
    );
  }
}
