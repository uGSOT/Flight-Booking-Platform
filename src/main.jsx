import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AuthModalProvider } from "./context/AuthModalContext.jsx";
import { BookingProvider } from "./context/BookingContext.jsx";
import App from "./App.jsx";
import { seedDemoData } from "./lib/seedDemo.js";
import "./styles/tokens.css";
import "./styles/globals.css";

seedDemoData();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AuthModalProvider>
            <BookingProvider>
              <App />
            </BookingProvider>
          </AuthModalProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
