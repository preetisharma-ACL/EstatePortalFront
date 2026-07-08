import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { MetaProvider, Title } from "@solidjs/meta";
import { Suspense, ErrorBoundary } from "solid-js";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import DataError from "~/components/DataError";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          {/* Fallback title only — every route sets its own Title + description.
              Keeping a default description here would duplicate the per-route one. */}
          <Title>EstatePortal — RERA-verified real estate across India</Title>
          <div class="flex min-h-screen flex-col bg-paper">
            <Header />
            <main class="flex-1">
              <ErrorBoundary fallback={(_err, reset) => <DataError reset={reset} />}>
                <Suspense>{props.children}</Suspense>
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
