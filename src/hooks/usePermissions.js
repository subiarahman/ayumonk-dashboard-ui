import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

// Slug-to-resource translation. The frontend uses kebab-case slugs (matching
// menu slugs from /accessible-menus); the backend uses snake_case resource
// names in permission codenames (e.g. `company_users:create`). When in doubt,
// hyphens become underscores and the slug *is* the resource — this map only
// captures the exceptions.
const RESOURCE_BY_SLUG = {
  companies: "company_master",
  "company-data": "company_master",
  "company-users": "company_users",
  users: "company_users",
  departments: "company_users",
  themes: "themes",
  kpis: "kpis",
  "kpi-questions": "kpis",
  questions: "kpis",
  challenges: "challenges",
  sessions: "sessions",
  submissions: "sessions",
  "my-responses": "sessions",
  "suggestion-master": "suggestion",
  "kpi-suggestion-mapping": "suggestion",
  roles: "platform",
  permissions: "platform",
  policies: "platform",
  "role-assignments": "platform",
  menus: "platform",
};

const slugToResource = (slugOrResource) => {
  if (!slugOrResource) return "";
  if (RESOURCE_BY_SLUG[slugOrResource]) return RESOURCE_BY_SLUG[slugOrResource];
  // Fallback: kebab → snake (covers any future menu added without an explicit map entry).
  return String(slugOrResource).replace(/-/g, "_");
};

const buildHelpers = (permissions, menus, isPlatformAdmin) => {
  const granted = new Set(
    (permissions || [])
      .filter((entry) => entry?.is_granted === true)
      .map((entry) => entry.codename),
  );
  const menuBySlug = new Map(
    (menus || []).map((menu) => [menu?.slug, menu]),
  );

  // Primary primitive — accepts a full codename like "kpis:create".
  // Platform admins bypass RBAC entirely (spec §1).
  const can = (codename) => {
    if (isPlatformAdmin) return true;
    if (!codename) return false;
    return granted.has(codename);
  };

  const canAction = (slugOrResource, action) =>
    can(`${slugToResource(slugOrResource)}:${action}`);

  return {
    can,
    canCreate: (slugOrResource) => canAction(slugOrResource, "create"),
    canEdit: (slugOrResource) => canAction(slugOrResource, "update"),
    canDelete: (slugOrResource) => canAction(slugOrResource, "delete"),
    canView: (slugOrResource) => canAction(slugOrResource, "read"),
    hasMenu: (slug) => menuBySlug.has(slug),

    // Display-only: tells the UI whether a menu is read-only so it can render
    // a "Read-only" badge. NEVER use for authorization decisions.
    getMenuAccessLevel: (slug) => menuBySlug.get(slug)?.access_level || null,
    isReadOnlyDisplay: (slug) =>
      menuBySlug.get(slug)?.access_level === "view",

    /**
     * @deprecated Use `canCreate` / `canEdit` / `canDelete` (codename-based).
     * Kept temporarily so legacy call sites compile during the per-action
     * migration; returns true if ANY write action is granted on the resource.
     */
    canWrite: (slugOrResource) =>
      canAction(slugOrResource, "create") ||
      canAction(slugOrResource, "update") ||
      canAction(slugOrResource, "delete"),
  };
};

export default function usePermissions() {
  const { permissions, menus, policy, loaded, loading } = useSelector(
    (state) => state.permission,
  );
  const isPlatformAdmin = useSelector(
    (state) => state.auth?.isPlatformAdmin,
  );

  const helpers = useMemo(
    () => buildHelpers(permissions, menus, isPlatformAdmin),
    [permissions, menus, isPlatformAdmin],
  );

  // Stable `can` reference for downstream useMemo/useCallback dependencies.
  const can = useCallback(
    (codename) => helpers.can(codename),
    [helpers],
  );

  return {
    ...helpers,
    can,
    permissions,
    menus,
    policy,
    loaded,
    loading,
    isPlatformAdmin: Boolean(isPlatformAdmin),
  };
}

export { slugToResource };
