import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { router } from "./App.jsx"; // <-- ovo je ključno!

import { RouterProvider } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
