import usePermissions from "../../hooks/usePermissions";

/**
 * Codename-based UI gate. Spec §3.
 *
 *   <RequirePermission codename="kpis:create">
 *     <Button>+ New KPI</Button>
 *   </RequirePermission>
 *
 * Platform admins bypass the gate (handled inside `usePermissions().can`).
 *
 * Props:
 *   - codename: full backend codename, e.g. "kpis:create" / "company_users:delete".
 *   - fallback: optional ReactNode to render when the gate denies (default: null).
 */
export default function RequirePermission({ codename, fallback = null, children }) {
  const { can } = usePermissions();
  return can(codename) ? children : fallback;
}
