import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import sessionReducer from "./sessionSlice";
import companyReducer from "./companySlice";
import userReducer from "./userSlice";
import questionReducer from "./questionSlice";
import userUploadReducer from "./userUploadSlice";
import questionHierarchyReducer from "./questionHierarchySlice";
import themeReducer from "./themeSlice";
import kpiReducer from "./kpiSlice";
import challengeReducer from "./challengeSlice";
import dashboardReducer from "./dashboardSlice";
import adminSuggestionReducer from "./adminSuggestionSlice";
import kpiSuggestionMappingReducer from "./kpiSuggestionMappingSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    company: companyReducer,
    user: userReducer,
    question: questionReducer,
    userUpload: userUploadReducer,
    questionHierarchy: questionHierarchyReducer,
    theme: themeReducer,
    kpi: kpiReducer,
    challenge: challengeReducer,
    dashboard: dashboardReducer,
    adminSuggestion: adminSuggestionReducer,
    kpiSuggestionMapping: kpiSuggestionMappingReducer,
  },
});

export default store;
