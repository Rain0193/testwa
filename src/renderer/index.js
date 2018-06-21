// @ts-check
"use strict";
console.log("渲染进程入口模块");
import React from "react";
import { render } from "react-dom";
import { Provider } from "styletron-react";
import { parse } from "querystring";
import { f } from "./assembly/module";
// asmPromise.then(function(asmModule) {
// here you can use the wasm.exports
console.log("===========", f(1));
// });
import "./app.css";
(async () => {
  console.log("路由选择");
  const device = parse(location.search.substr(1)).device;
  const Route = device
    ? await import("./components/Inspector")
    : await import("./components/devices");
  render(
    <Provider value={new (require("styletron-engine-atomic")).Client()}>
      <Route.default device={device} />
      {console.log("渲染进程页面渲染,device", device)}
    </Provider>,
    document.getElementById("app")
  );
})();
