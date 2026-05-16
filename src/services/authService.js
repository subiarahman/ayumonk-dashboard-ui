import api from "./api";
import { API_URLS } from "./apiUrls";

const STORAGE_KEYS = {
  permissions: "rbac_permissions",
  menus: "rbac_menus",
  policy: "rbac_policy",
};

const safeParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const readStorage = () => ({
  permissions: safeParse(localStorage.getItem(STORAGE_KEYS.permissions), []),
  menus: safeParse(localStorage.getItem(STORAGE_KEYS.menus), []),
  policy: safeParse(localStorage.getItem(STORAGE_KEYS.policy), null),
});

const writeStorage = ({ permissions, menus, policy }) => {
  if (permissions !== undefined) {
    localStorage.setItem(STORAGE_KEYS.permissions, JSON.stringify(permissions));
  }
  if (menus !== undefined) {
    localStorage.setItem(STORAGE_KEYS.menus, JSON.stringify(menus));
  }
  if (policy !== undefined) {
    localStorage.setItem(STORAGE_KEYS.policy, JSON.stringify(policy));
  }
};

class AuthService {
  constructor() {
    const cached = readStorage();
    this.permissions = cached.permissions;
    this.menus = cached.menus;
    this.policy = cached.policy;
    this.loaded = Boolean(
      cached.permissions?.length || cached.menus?.length || cached.policy,
    );
    this._inflight = null;
  }

  async loadAuthorization({ force = false } = {}) {
    if (!force && this.loaded) {
      return this.snapshot();
    }
    if (this._inflight) return this._inflight;

    this._inflight = (async () => {
      const [permissionsRes, policyRes, menusRes] = await Promise.all([
        api.get(API_URLS.authMyPermissions),
        api.get(API_URLS.authMyEffectivePolicy),
        api.get(API_URLS.authMyAccessibleMenus),
      ]);

      this.permissions = Array.isArray(permissionsRes.data)
        ? permissionsRes.data
        : [];
      this.policy = policyRes.data || null;
      this.menus = Array.isArray(menusRes.data) ? menusRes.data : [];
      this.loaded = true;

      writeStorage({
        permissions: this.permissions,
        menus: this.menus,
        policy: this.policy,
      });

      return this.snapshot();
    })();

    try {
      return await this._inflight;
    } finally {
      this._inflight = null;
    }
  }

  snapshot() {
    return {
      permissions: this.permissions,
      menus: this.menus,
      policy: this.policy,
    };
  }

  clear() {
    this.permissions = [];
    this.menus = [];
    this.policy = null;
    this.loaded = false;
    this._inflight = null;
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  }

  getPermissions() {
    return this.permissions;
  }

  getMenus() {
    return this.menus;
  }

  getPolicy() {
    return this.policy;
  }

  hasPermission(codename) {
    if (!codename) return false;
    return this.permissions.some(
      (entry) => entry?.codename === codename && entry?.is_granted === true,
    );
  }

  canCreate(module) {
    return this.hasPermission(`${module}:create`);
  }

  canEdit(module) {
    return this.hasPermission(`${module}:update`);
  }

  canDelete(module) {
    return this.hasPermission(`${module}:delete`);
  }

  canView(module) {
    return this.hasPermission(`${module}:read`);
  }

  getMenu(slug) {
    return this.menus.find((menu) => menu?.slug === slug) || null;
  }

  hasMenu(slug) {
    return Boolean(this.getMenu(slug));
  }

  getMenuAccessLevel(slug) {
    return this.getMenu(slug)?.access_level || null;
  }

  isReadOnly(slug) {
    return this.getMenuAccessLevel(slug) === "view";
  }

  hasFullAccess(slug) {
    return this.getMenuAccessLevel(slug) === "full";
  }
}

const authService = new AuthService();

export default authService;
