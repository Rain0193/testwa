import React from "react";
import ReactDOM from "react-dom";

import App from "./components";
import { AppContainer } from "react-hot-loader";
require("common/server");
const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById("app")
  );
};

render(App);

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept("./components", () => {
    render(require("./components"));
  });
}
