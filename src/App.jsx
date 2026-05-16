import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import OnboardingGate from "./components/OnboardingGate";
import { loadAuthorization } from "./store/permissionSlice";
import { syncPushSubscriptionWithBackend } from "./hooks/usePushNotifications";

function App() {
  const dispatch = useDispatch();
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  const loaded = useSelector((state) => state.permission.loaded);
  const loading = useSelector((state) => state.permission.loading);

  useEffect(() => {
    if (authenticated && !loaded && !loading) {
      dispatch(loadAuthorization());
    }
  }, [authenticated, loaded, loading, dispatch]);

  // Re-attach any anonymous browser push subscription to the user once they
  // log in. No-ops if push is unsupported or no subscription exists yet.
  useEffect(() => {
    if (!authenticated) return;
    syncPushSubscriptionWithBackend();
  }, [authenticated]);

  return (
    <OnboardingGate>
      <AppRoutes />
    </OnboardingGate>
  );
}

export default App;