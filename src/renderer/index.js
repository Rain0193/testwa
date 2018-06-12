// @ts-check
"use strict";
console.log("渲染进程入口模块");
import React from "react";
import { render } from "react-dom";
import { Provider } from "styletron-react";
import { parse } from "querystring";
import "./antd.min.css";
(async () => {
  console.log("路由选择");
  const Route = parse(location.search.substr(1)).device
    ? await import("./components/Inspector")
    : await import("./components/devices");
  render(
    <Provider value={new (require("styletron-engine-atomic")).Client()}>
      <Route.default />
      {console.log("渲染进程页面渲染")}
    </Provider>,
    document.getElementById("app")
  );
})();
