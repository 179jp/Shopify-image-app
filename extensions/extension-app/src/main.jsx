import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const appRoot = document.getElementById("extendGalleryAppRoot");
const mode = appRoot ? appRoot.getAttribute("data-mode") : "";
const handle = appRoot ? appRoot.getAttribute("data-handle") : "";

createRoot(appRoot).render(
  <StrictMode>
    <App mode={mode} handle={handle} />
  </StrictMode>,
);
