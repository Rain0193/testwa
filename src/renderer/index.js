// @ts-check
"use strict";
import React from "react";
import { render } from "react-dom";
import { Provider } from "styletron-react";
import { parse } from "querystring";
console.log("渲染进程入口模块");
(async () => {
  const Route = parse(location.search.substr(1)).device
    ? await import("./components/Inspector")
    : await import("./components/devices");
  render(
    <Provider value={new (require("styletron-engine-atomic")).Client()}>
      <Route.default />
      {console.log("渲染进程路由选择")}
    </Provider>,
    document.getElementById("app")
  );
})();
