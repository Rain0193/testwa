// @ts-check
"use strict";
import React from "react";
import { render } from "react-dom";
import { Provider } from "styletron-react";
import { parse } from "querystring";
import Main from "./components/devices";
import Inspector from "./components/Inspector";

export const device = parse(location.search.substr(1));
render(
  <Provider value={new (require("styletron-engine-atomic")).Client()}>
    {device.device ? (
      <Inspector
      // minitouch={require("net").connect({ port: 1718 })}
      // minicap={require("net").connect({ port: 1717 })}
      />
    ) : (
      <Main />
    )}
  </Provider>,
  document.getElementById("app")
);
