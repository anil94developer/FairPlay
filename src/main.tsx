import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { setupIonicReact } from "@ionic/react";
import { Provider } from "react-redux";
import store from "./store/store";

setupIonicReact();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
