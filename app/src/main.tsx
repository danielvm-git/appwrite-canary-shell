import "@phosphor-icons/web/regular";
import "./styles/app.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { SessionProvider } from "./hooks/useSession";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </StrictMode>,
);
