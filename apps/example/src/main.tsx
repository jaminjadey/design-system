import React from "react";
import ReactDOM from "react-dom/client";
import { DemoThemeProvider } from "@demo-ds/mantine-theme";
import "@mantine/core/styles.css";
import "@demo-ds/tokens/tokens.css";
import "./app.css";

import { App } from "./App.js";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <DemoThemeProvider defaultColorScheme="light">
      <App />
    </DemoThemeProvider>
  </React.StrictMode>
);
