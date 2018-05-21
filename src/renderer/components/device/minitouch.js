export default class MiniTouch {
  constructor() {
    this.client = require("net").connect({ port: 1718 });
    this.isPressing = false;
  }
  onMouseDown(pos) {
    this.isPressing = true;
    this.client.write(`d 0 ${pos.x} ${pos.y} 50\n`);
    this.client.write("c\n");
  }
  onMouseUp() {
    this.isPressing = false;
    this.client.write("u 0\n");
    this.client.write("c\n");
  }
  onMove(pos) {
    if (!this.isPressing) return;
    this.client.write(`m 0 ${pos.x} ${pos.y} 50\n`);
    this.client.write("c\n");
  }
  onMoveOut() {
    this.isPressing = false;
  }
  onHome() {
    this.client.write("h\n");
  }
  onMenu() {
    this.client.write("e\n");
  }
  onBack() {
    this.client.write("b\n");
  }
}
