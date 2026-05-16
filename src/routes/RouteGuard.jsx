import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadAuthorization } from "../store/permissionSlice";
import usePermissions from "../hooks/usePermissions";
import AccessDenied from "../pages/common/AccessDenied";

/**
 * Two responsibilities:
 *   1. Auth — unauthenticated users go to /login.
 *   2. Authorization (deep-link safety) — when the route specifies a
 *      `codename` (e.g. "kpis:read"), block render with <AccessDenied />
 *      if the user lacks it. Without this, a user could deep-link to a
 *      page their accessible-menus would normally hide and trigger the
 *      first 403 server-side instead of a clean fallback.
 *
 * Pass `bypass` for fully public routes (e.g. session form share links).
 */
export default function RouteGuard({ children, codename, bypass = false }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  const { loaded, loading } = useSelector((state) => state.permission);
  const { can } = usePermissions();

  useEffect(() => {
    if (authenticated && !loaded && !loading) {
      dispatch(loadAuthorization());
    }
  }, [authenticated, loaded, loading, dispatch]);

  if (bypass) {
    return children;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Wait for the bootstrap before deciding — otherwise an authenticated user
  // on first paint would see AccessDenied flash before /users/me/permissions
  // resolves. Render nothing during the brief load window.
  if (codename && !loaded) {
    return null;
  }

  if (codename && !can(codename)) {
    return <AccessDenied />;
  }

  return children;
}
