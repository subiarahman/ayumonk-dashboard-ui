import { useSelector } from "react-redux";

/**
 * Centralised tenant resolution:
 * - For platform admins, the active tenant is whatever they last picked
 *   (state.tenantContext.activeTenantId).
 * - For tenant users, the effective tenant is locked to their JWT claim
 *   (state.auth.jwtTenantId), with the user.company_id as a fallback.
 *
 * `effectiveTenantId` is the value to attach to domain-API requests.
 * `canSwitchTenant` is true only for platform admins (UI uses this to
 * decide whether to render a tenant switcher).
 */
export default function useTenantContext() {
  const isPlatformAdmin = useSelector((state) => state.auth.isPlatformAdmin);
  const jwtTenantId = useSelector((state) => state.auth.jwtTenantId);
  const userCompanyId = useSelector(
    (state) => state.auth.user?.company_id || "",
  );
  const activeTenantId = useSelector(
    (state) => state.tenantContext.activeTenantId,
  );

  const effectiveTenantId = isPlatformAdmin
    ? activeTenantId
    : jwtTenantId || userCompanyId;

  // Spec §7: never send company_id for tenant users — the backend derives it
  // from the JWT. Platform admins must attach the active tenant they picked.
  const companyIdForRequest = isPlatformAdmin ? activeTenantId : "";

  return {
    isPlatformAdmin: Boolean(isPlatformAdmin),
    activeTenantId,
    jwtTenantId,
    effectiveTenantId,
    companyIdForRequest,
    canSwitchTenant: Boolean(isPlatformAdmin),
  };
}
