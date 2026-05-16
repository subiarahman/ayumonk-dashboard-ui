import usePermissions from "../../hooks/usePermissions";

export default function PermissionGate({
  permission,
  permissions,
  any = false,
  module,
  action,
  menu,
  fullAccess = false,
  fallback = null,
  children,
}) {
  const perms = usePermissions();

  let allowed = true;

  if (permission) {
    allowed = allowed && perms.hasPermission(permission);
  }

  if (Array.isArray(permissions) && permissions.length) {
    allowed =
      allowed &&
      (any
        ? permissions.some((code) => perms.hasPermission(code))
        : permissions.every((code) => perms.hasPermission(code)));
  }

  if (module && action) {
    const codename = `${module}:${action}`;
    allowed = allowed && perms.hasPermission(codename);
  }

  if (menu) {
    allowed =
      allowed && (fullAccess ? perms.hasFullAccess(menu) : perms.hasMenu(menu));
  }

  return allowed ? children : fallback;
}
