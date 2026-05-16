// main.jsx — React entry point. Mounts the App component into the DOM.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  // StrictMode intentionally renders components twice in development
  // to help catch side effects. Has no effect in production builds.
  <StrictMode>
    <App />
  </StrictMode>
);