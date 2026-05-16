import { loadAuthorization } from "../permissionSlice";

// Action types that change a role's grants. When one of these resolves, the
// currently logged-in user's accessible-menus / permissions / effective-policy
// may have shifted (if they hold the affected role), so we re-fetch the
// bootstrap APIs unconditionally — three cheap GETs is cheaper than tracking
// "does this role apply to me".
const RBAC_MUTATION_TYPES = new Set([
  "roleAssignment/addRolePermissions/fulfilled",
  "roleAssignment/removeRolePermissions/fulfilled",
  "roleAssignment/addRolePolicies/fulfilled",
  "roleAssignment/removeRolePolicies/fulfilled",
  "roleAssignment/addRoleMenus/fulfilled",
  "roleAssignment/removeRoleMenus/fulfilled",
  // Role-level edits / deletes can also flip access (e.g. a role made
  // inactive should drop sidebar items for users who hold it).
  "role/updateRole/fulfilled",
  "role/deleteRole/fulfilled",
]);

const rbacInvalidationMiddleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  if (action?.type && RBAC_MUTATION_TYPES.has(action.type)) {
    // Fire-and-forget; failures are surfaced by loadAuthorization itself.
    storeApi.dispatch(loadAuthorization({ force: true }));
  }
  return result;
};

export default rbacInvalidationMiddleware;
