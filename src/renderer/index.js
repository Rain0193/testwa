import React from "react";
import { render } from "react-dom";
import { Provider } from "styletron-react";
import { parse } from "querystring";
import Main from "./components/main/index";
import Device from "./components/device/index";
render(
  <Provider value={new (require("styletron-engine-atomic")).Client()}>
    {parse(window.location.search)["?device"] ? (
      <Device deviceId={parse(window.location.search)["?device"]} />
    ) : (
      <Main />
    )}
  </Provider>,
  document.getElementById("app")
);
