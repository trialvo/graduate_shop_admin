import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";

import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AppBrandingProvider } from "./context/AppBrandingContext.tsx";

import AppProviders from "./providers/AppProviders.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppBrandingProvider>
        <AppProviders>
          <AppWrapper>
            <App />
          </AppWrapper>
        </AppProviders>
      </AppBrandingProvider>
    </ThemeProvider>
  </StrictMode>
);
