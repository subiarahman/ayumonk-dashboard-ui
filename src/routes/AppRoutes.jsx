import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import AdminDashboard from "../pages/admin/Dashboard";
import CompanyData from "../pages/superadmin/CompanyData";
import CompanyDataForm from "../pages/superadmin/CompanyDataForm";
import CompanyDataView from "../pages/superadmin/CompanyDataView";
import CompanyUsers from "../pages/admin/CompanyUsers";
import CompanyUsersForm from "../pages/admin/CompanyUsersForm";
import CompanyUsersView from "../pages/admin/CompanyUsersView";
import Questions from "../pages/admin/Questions";
import QuestionsForm from "../pages/admin/QuestionsForm";
import QuestionsView from "../pages/admin/QuestionsView";
import Sessions from "../pages/admin/Sessions";
import SessionEditor from "../pages/admin/SessionEditor";
import SessionManagement from "../pages/admin/SessionManagement";
import Themes from "../pages/admin/Themes";
import ThemeForm from "../pages/admin/ThemeForm";
import ThemeView from "../pages/admin/ThemeView";
import Kpis from "../pages/admin/Kpis";
import KpiForm from "../pages/admin/KpiForm";
import KpiView from "../pages/admin/KpiView";
import Challenges from "../pages/admin/Challenges";
import ChallengeForm from "../pages/admin/ChallengeForm";
import ChallengeView from "../pages/admin/ChallengeView";
import Login from "../pages/auth/Login";
import Profile from "../pages/common/Profile";
import SessionForm from "../pages/common/SessionForm";
import SketchLab from "../pages/hidden/SketchLab";
import UserDashboard from "../pages/user/Dashboard";
import MyResponses from "../pages/user/MyResponses";
import SuperAdminDashboard from "../pages/superadmin/Dashboard";
import SuggestionMaster from "../pages/superadmin/SuggestionMaster";
import SuggestionForm from "../pages/superadmin/SuggestionForm";
import SuggestionView from "../pages/superadmin/SuggestionView";
import KpiSuggestionMapping from "../pages/superadmin/KpiSuggestionMapping";
import KpiSuggestionMappingForm from "../pages/superadmin/KpiSuggestionMappingForm";
import KpiSuggestionMappingView from "../pages/superadmin/KpiSuggestionMappingView";
import ClientPage from "../pages/hidden/ClientPage";

const getHomePathForRole = (role) => {
  switch (role) {
    case "superadmin":
      return "/super-admin/dashboard";
    case "user":
      return "/user/dashboard";
    case "admin":
    default:
      return "/admin/dashboard";
  }
};

function ProtectedRoute({ children, allowedRole }) {
  const location = useLocation();
  const role = useSelector((state) => state.auth.role);
  const authenticated = useSelector((state) => state.auth.isAuthenticated);

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRole && role !== allowedRole) {
    const fallback = getHomePathForRole(role);
    return <Navigate to={fallback} replace />;
  }

  return children;
}

function LoginRoute({ fallback }) {
  const location = useLocation();
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  const redirectTarget = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ""}${location.state.from.hash || ""}`
    : fallback;

  return authenticated ? <Navigate to={redirectTarget} replace /> : <Login />;
}

export default function AppRoutes() {
  const role = useSelector((state) => state.auth.role);
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  const fallback = getHomePathForRole(role);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={authenticated ? fallback : "/login"} replace />}
      />
      <Route path="/login" element={<LoginRoute fallback={fallback} />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company-details"
        element={
          <ProtectedRoute allowedRole="admin">
            <CompanyDataForm mode="edit" role="admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company-users"
        element={
          <ProtectedRoute allowedRole="admin">
            <CompanyUsers role="admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company-users/:id"
        element={
          <ProtectedRoute allowedRole="admin">
            <CompanyUsersView role="admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company-users/:id/edit"
        element={
          <ProtectedRoute allowedRole="admin">
            <CompanyUsersForm mode="edit" role="admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/themes"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <Themes role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/themes/:id"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <ThemeView role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kpis"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <Kpis role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kpis/:id"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <KpiView role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/challenges"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <Challenges role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/challenges/:id"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <ChallengeView role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <Questions role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questions/:id"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <QuestionsView role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/company-data"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <CompanyData />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/company-data/add"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <CompanyDataForm mode="add" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/company-data/:id"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <CompanyDataView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/company-data/:id/edit"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <CompanyDataForm mode="edit" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/company-users"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <CompanyUsers role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/company-users/add"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <CompanyUsersForm mode="add" role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/company-users/:id"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <CompanyUsersView role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/company-users/:id/edit"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <CompanyUsersForm mode="edit" role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/questions"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <Questions role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/questions/add"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <QuestionsForm mode="add" role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/questions/:id"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <QuestionsView role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/questions/:id/edit"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <QuestionsForm mode="edit" role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/themes"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <Themes role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/themes/add"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <ThemeForm mode="add" role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/themes/:id"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <ThemeView role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/themes/:id/edit"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <ThemeForm mode="edit" role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/kpis"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <Kpis role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/kpis/add"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <KpiForm mode="add" role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/kpis/:id"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <KpiView role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/kpis/:id/edit"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <KpiForm mode="edit" role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/challenges"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <Challenges role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/challenges/add"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <ChallengeForm mode="add" role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/challenges/:id"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <ChallengeView role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/challenges/:id/edit"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <ChallengeForm mode="edit" role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/sessions"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <Sessions role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/sessions/add"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <SessionEditor mode="add" role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/sessions/:id/edit"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <SessionEditor mode="edit" role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/sessions/:id/manage"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <SessionManagement role="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/company-users/add" element={<Navigate to="/admin/company-users" replace />} />
      <Route path="/admin/themes/add" element={<Navigate to="/admin/themes" replace />} />
      <Route path="/admin/themes/:id/edit" element={<Navigate to="/admin/themes" replace />} />
      <Route path="/admin/kpis/add" element={<Navigate to="/admin/kpis" replace />} />
      <Route path="/admin/kpis/:id/edit" element={<Navigate to="/admin/kpis" replace />} />
      <Route path="/admin/challenges/add" element={<Navigate to="/admin/challenges" replace />} />
      <Route path="/admin/challenges/:id/edit" element={<Navigate to="/admin/challenges" replace />} />
      <Route path="/admin/sessions" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/sessions/add" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/sessions/:id/edit" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/sessions/:id/manage" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/questions/add" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/questions/:id/edit" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/super-admin/dashboard"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/suggestion-master"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <SuggestionMaster />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/suggestion-master/add"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <SuggestionForm mode="add" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/suggestion-master/:id"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <SuggestionView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/suggestion-master/:id/edit"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <SuggestionForm mode="edit" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/kpi-suggestion-mapping"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <KpiSuggestionMapping />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/kpi-suggestion-mapping/add"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <KpiSuggestionMappingForm mode="add" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/kpi-suggestion-mapping/:id"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <KpiSuggestionMappingView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/kpi-suggestion-mapping/:id/edit"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <KpiSuggestionMappingForm mode="edit" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/my-responses"
        element={
          <ProtectedRoute allowedRole="user">
            <MyResponses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions/:id/form"
        element={
          <ProtectedRoute>
            <SessionForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute>
            <ClientPage />
          </ProtectedRoute>
        }
      />

      <Route path="/vault/ink-room-7f3a" element={<SketchLab />} />

      <Route
        path="*"
        element={<Navigate to={authenticated ? fallback : "/login"} replace />}
      />
    </Routes>
  );
}
