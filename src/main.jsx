import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AuthModalProvider } from "./context/AuthModalContext.jsx";
import { BookingProvider } from "./context/BookingContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Toaster from "./components/Toaster.jsx";
import App from "./App.jsx";
import { seedDemoData } from "./lib/seedDemo.js";
import { isSupabaseConfigured } from "./lib/supabase.js";
import { toast } from "./lib/toast.js";
import "./styles/tokens.css";
import "./styles/globals.css";

// Demo seed only backs local-only mode; with Supabase, data lives in the DB.
if (!isSupabaseConfigured) seedDemoData();

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error?.message || "Something went wrong while loading data.");
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AuthModalProvider>
              <BookingProvider>
                <App />
                <Toaster />
              </BookingProvider>
            </AuthModalProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
