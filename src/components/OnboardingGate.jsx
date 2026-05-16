import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { fetchMyLinks, fetchMySubmissions } from "../store/sessionSlice";
import SessionForm from "../pages/common/SessionForm";

// First-form onboarding gate.
//
// For role="user" accounts (excluding platform admins) on first login, this
// renders the first available session form full-page and blocks access to the
// rest of the app until the user submits at least one form. After a successful
// submit, mySubmissions is refetched, the gate condition flips, and children
// render normally.
//
// Skipped for: unauthenticated users, admin/superadmin/platform-admin roles,
// and the public /sessions/:id/form bypass route (so direct share-links keep
// working without being hijacked into the "first" form).
export default function OnboardingGate({ children }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = useSelector((state) => state.auth.role);
  const isPlatformAdmin = useSelector((state) => state.auth.isPlatformAdmin);
  const { mySubmissions, myLinks } = useSelector((state) => state.session);

  const [bootstrapped, setBootstrapped] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const isUserRole = role === "user" && !isPlatformAdmin;
  const isPublicSessionForm =
    location.pathname.startsWith("/sessions/") &&
    location.pathname.endsWith("/form");
  const shouldGate = authenticated && isUserRole && !isPublicSessionForm;

  useEffect(() => {
    if (!shouldGate) return;
    if (bootstrapped) return;
    Promise.all([
      dispatch(fetchMySubmissions()),
      dispatch(fetchMyLinks()),
    ]).finally(() => setBootstrapped(true));
  }, [bootstrapped, dispatch, shouldGate]);

  // Reset the bootstrap flag on logout so the next user is re-evaluated.
  useEffect(() => {
    if (!authenticated) {
      setBootstrapped(false);
      setTransitioning(false);
    }
  }, [authenticated]);

  // Triggered when the user clicks "Continue to dashboard" inside the
  // forced SessionForm. Refetching mySubmissions flips the gate condition
  // on the next render so children take over. We use a local `transitioning`
  // flag instead of the slice's loading flag because the Dashboard also
  // refetches mySubmissions on mount — relying on global loading state would
  // bounce us back to the spinner and cause an unmount/remount loop.
  const handleContinue = useCallback(async () => {
    setTransitioning(true);
    try {
      await dispatch(fetchMySubmissions()).unwrap();
    } catch {
      // Swallow — even on failure we want to release the gate; the user has
      // submitted (the form's success state proves it). Worst case the next
      // refresh of the dashboard will pick up the data.
    } finally {
      setTransitioning(false);
    }
  }, [dispatch]);

  if (!shouldGate) return children;

  if (!bootstrapped || transitioning) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            {transitioning ? "Loading dashboard..." : "Preparing your dashboard..."}
          </Typography>
        </Stack>
      </Box>
    );
  }

  const hasSubmittedAny = mySubmissions.length > 0;
  const firstLink = myLinks[0];

  if (!hasSubmittedAny && firstLink?.session_id) {
    return (
      <SessionForm
        sessionId={firstLink.session_id}
        onContinue={handleContinue}
        continueLabel="Continue to dashboard"
      />
    );
  }

  return children;
}
