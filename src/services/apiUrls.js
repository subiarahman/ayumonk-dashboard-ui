export const API_URLS = {
  authLogin: "/authentication/api/v1/auth/login",

  adminSuggestions: "/config/api/v1/admin/suggestions",
  adminSuggestionById: (suggestionId) =>
    `/config/api/v1/admin/suggestions/${suggestionId}`,

  challenges: "/config/api/v1/challenges",
  challengeById: (challengeKey) => `/config/api/v1/challenges/${challengeKey}`,
  challengeKpiMappings: (challengeKey) =>
    `/config/api/v1/challenges/${challengeKey}/kpi-mappings`,

  companies: "/config/api/v1/companies",
  companyById: (companyId) => `/config/api/v1/companies/${companyId}`,
  companyAdmin: (companyId) => `/config/api/v1/companies/${companyId}/admin`,
  companyUpload: "/config/api/v1/companies/upload",
  companyMe: "/config/api/v1/companies/me",

  dashboardKpis: "/config/api/v1/dashboard/kpis",
  dashboardChallengeAction: "/config/api/v1/dashboard/challenges/action",
  sessionSuggestions: (sessionId) => `/api/v1/sessions/${sessionId}/suggestions`,

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
};
