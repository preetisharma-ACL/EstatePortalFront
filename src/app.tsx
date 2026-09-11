import { Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { MetaProvider, Title } from "@solidjs/meta";
import { Suspense, ErrorBoundary, Show } from "solid-js";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import ProjectFooter from "~/components/ProjectFooter";
import DataError from "~/components/DataError";
import LeadPopup from "~/components/LeadPopup";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => {
        const location = useLocation();
        // Project detail pages run their own chrome: a header whose nav is the
        // page's own sections, and a disclaimer-only footer. The header lives
        // inside the route (see routes/project/[slug].tsx) because its nav
        // depends on which sections the payload actually filled — only the
        // footer can be swapped from here.
        const isProjectPage = () => location.pathname.startsWith("/project/");

        return (
          <MetaProvider>
            {/* Fallback title only — every route sets its own Title + description.
                Keeping a default description here would duplicate the per-route one. */}
            <Title>Aajneeti Real Estate — RERA-verified real estate across India</Title>
            <div class="flex min-h-screen flex-col bg-paper">
              <Show when={!isProjectPage()}>
                <Header />
              </Show>
              <main class="flex-1">
                <ErrorBoundary fallback={(_err, reset) => <DataError reset={reset} />}>
                  <Suspense>{props.children}</Suspense>
                </ErrorBoundary>
              </main>
              <Show when={isProjectPage()} fallback={<Footer />}>
                <ProjectFooter />
              </Show>
            </div>
            {/* First-visit lead popup (opens once, 3s after arrival) */}
            <LeadPopup />
          </MetaProvider>
        );
      }}
    >
      <FileRoutes />
    </Router>
  );
}
