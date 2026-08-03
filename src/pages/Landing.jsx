import { useEffect, useState } from "react";
import LoginModal from "./auth/LoginModal";

// Public marketing landing page shown at "/".
//
// The page is a self-contained static document (public/landing.html) that ships
// its own global CSS reset, fonts and chatbot script. Hosting it in a full-
// viewport iframe isolates all of that from the app's MUI theme/CssBaseline, so
// it can't leak styles into the SPA.
//
// The in-page "Log in" buttons postMessage the parent (see public/landing.js)
// instead of navigating, so login opens as a Dialog overlaid on the landing
// page rather than routing away to /login. On successful sign-in LoginForm
// navigates to the workspace, which unmounts this page and the modal.
export default function Landing() {
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const onMessage = (event) => {
      // Only trust messages from our own origin (the same-origin iframe).
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === "ayumonk:open-login") {
        setLoginOpen(true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <>
      <iframe
        title="Ayumonk — Wellness Intelligence Platform"
        src="/landing.html"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
