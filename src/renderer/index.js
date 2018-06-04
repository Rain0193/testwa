// @ts-check
"use strict";
import React from "react";
import { render } from "react-dom";
import { Provider } from "styletron-react";
import { parse } from "querystring";
import Devices from "./components/devices";
import Inspector from "./components/Inspector";

render(
  <Provider value={new (require("styletron-engine-atomic")).Client()}>
    {parse(location.search.substr(1)).device ? <Inspector /> : <Devices />}
  </Provider>,
  document.getElementById("app")
);
