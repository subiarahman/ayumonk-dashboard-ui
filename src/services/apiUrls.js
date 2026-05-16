export const API_URLS = {
  authLogin: "/authentication/api/v1/auth/login",
  authMyPermissions: "/authentication/api/v1/auth/users/me/permissions",
  authMyEffectivePolicy: "/authentication/api/v1/auth/users/me/effective-policy",
  authMyAccessibleMenus: "/authentication/api/v1/auth/users/me/accessible-menus",

  roles: "/authentication/api/v1/auth/roles",
  roleById: (roleId) => `/authentication/api/v1/auth/roles/${roleId}`,

  permissionsMaster: "/authentication/api/v1/auth/permissions",
  permissionMasterById: (permissionId) =>
    `/authentication/api/v1/auth/permissions/${permissionId}`,

  policies: "/authentication/api/v1/auth/policies",

  menusMaster: "/authentication/api/v1/auth/menus",
  menusMasterAll: "/authentication/api/v1/auth/menus/all",
  menuMasterById: (menuId) => `/authentication/api/v1/auth/menus/${menuId}`,

  roleAddPermissions: (roleId) =>
    `/authentication/api/v1/auth/roles/${roleId}/permissions/add`,
  roleRemovePermissions: (roleId) =>
    `/authentication/api/v1/auth/roles/${roleId}/permissions/remove`,
  roleListPermissions: (roleId) =>
    `/authentication/api/v1/auth/roles/${roleId}/permissions`,
  roleAddPolicies: (roleId) =>
    `/authentication/api/v1/auth/roles/${roleId}/policies/add`,
  roleRemovePolicies: (roleId) =>
    `/authentication/api/v1/auth/roles/${roleId}/policies/remove`,
  roleAddMenus: (roleId) =>
    `/authentication/api/v1/auth/roles/${roleId}/menus/add`,
  roleRemoveMenus: (roleId) =>
    `/authentication/api/v1/auth/roles/${roleId}/menus/remove`,
  roleListMenus: (roleId) =>
    `/authentication/api/v1/auth/roles/${roleId}/menus`,

  userOverrideMenus: (userId) =>
    `/authentication/api/v1/auth/users/${userId}/menus`,
  userOverridePermissions: (userId) =>
    `/authentication/api/v1/auth/users/${userId}/permissions`,
  userAddPolicies: (userId) =>
    `/authentication/api/v1/auth/users/${userId}/policies/add`,

  adminSuggestions: "/config/api/v1/admin/suggestions",
  adminSuggestionById: (suggestionId) =>
    `/config/api/v1/admin/suggestions/${suggestionId}`,

  challenges: "/config/api/v1/challenges",
  challengeById: (challengeKey) => `/config/api/v1/challenges/${challengeKey}`,
  challengeKpiMappings: (challengeKey) =>
    `/config/api/v1/challenges/${challengeKey}/kpi-mappings`,

  departments: "/config/api/v1/departments",
  departmentById: (deptId) => `/config/api/v1/departments/${deptId}`,

  locations: "/config/api/v1/locations",

  companies: "/config/api/v1/companies",
  companyById: (companyId) => `/config/api/v1/companies/${companyId}`,
  companyAdmin: (companyId) => `/config/api/v1/companies/${companyId}/admin`,
  companyUpload: "/config/api/v1/companies/upload",
  companyMe: "/config/api/v1/companies/me",

  dashboardKpis: "/config/api/v1/dashboard/kpis",
  dashboardChallengeAction: "/config/api/v1/dashboard/challenges/action",
  dashboardWellnessTrends: "/config/api/v1/dashboard/wellness-trends",
  sessionSuggestions: (sessionId) => `/config/api/v1/sessions/${sessionId}/suggestions`,

  kpis: "/config/api/v1/kpi",
  kpiById: (kpiKey) => `/config/api/v1/kpi/${kpiKey}`,

  kpiSuggestionMappings: "/config/api/v1/admin/kpi-suggestion-mappings",
  kpiSuggestionMappingById: (mappingId) =>
    `/config/api/v1/admin/kpi-suggestion-mappings/${mappingId}`,

  questionHierarchy: "/config/api/v1/kpiquestions/hierarchy",
  questions: "/config/api/v1/kpi-questions",
  questionById: (questionId) => `/config/api/v1/kpi-questions/${questionId}`,
  questionUpload: "/config/api/v1/kpiquestions/upload",

  sessions: "/config/api/v1/sessions",
  sessionById: (sessionId) => `/config/api/v1/sessions/${sessionId}`,
  sessionQuestions: (sessionId) => `/config/api/v1/sessions/${sessionId}/questions`,
  sessionQuestionById: (sessionId, questionId) =>
    `/config/api/v1/sessions/${sessionId}/questions/${questionId}`,
  sessionQuestionsOrder: (sessionId) =>
    `/config/api/v1/sessions/${sessionId}/questions/order`,
  sessionMyLinks: "/config/api/v1/sessions/my-links",
  sessionMySubmissions: "/config/api/v1/sessions/my-submissions",
  sessionPreview: (sessionId) => `/config/api/v1/sessions/${sessionId}/form/preview`,
  sessionPublish: (sessionId) => `/config/api/v1/sessions/${sessionId}/publish`,
  sessionForm: (sessionId) => `/config/api/v1/sessions/${sessionId}/form`,
  sessionFormSubmit: (sessionId) =>
    `/config/api/v1/sessions/${sessionId}/form/submit`,

  themes: "/config/api/v1/themes",
  themeById: (themeKey) => `/config/api/v1/themes/${themeKey}`,

  users: "/config/api/v1/users",
  userById: (userId) => `/config/api/v1/users/${userId}`,
  userUpload: "/config/api/v1/users/upload",

  reminderSettings: "/config/api/v1/reminder-settings",
  reminderSettingsToggle: "/config/api/v1/reminder-settings/toggle",
  reminderSettingsSnooze: "/config/api/v1/reminder-settings/snooze",

  notifications: "/config/api/v1/notifications",
  notificationsUnreadCount: "/config/api/v1/notifications/unread-count",
  notificationsMarkAllRead: "/config/api/v1/notifications/mark-all-read",
  notificationRead: (id) => `/config/api/v1/notifications/${id}/read`,
  notificationDismiss: (id) => `/config/api/v1/notifications/${id}/dismiss`,
  notificationSnooze: (id) => `/config/api/v1/notifications/${id}/snooze`,
  notificationAction: (id) => `/config/api/v1/notifications/${id}/action`,
};
