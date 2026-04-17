import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Layout from "../../layouts/commonLayout/Layout";
import { fetchAdminSuggestions } from "../../store/adminSuggestionSlice";
import { fetchKpis } from "../../store/kpiSlice";
import {
  clearKpiSuggestionMappingDetailState,
  fetchKpiSuggestionMappingById,
} from "../../store/kpiSuggestionMappingSlice";
import { fetchQuestions } from "../../store/questionSlice";
import { fetchThemes } from "../../store/themeSlice";
import { getSurfaceBackground } from "../../theme";
import { formatDateTimeIST } from "../../utils/dateTime";

export default function KpiSuggestionMappingView() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { items: kpiItems } = useSelector((state) => state.kpi);
  const { items: questionItems } = useSelector((state) => state.question);
  const { items: suggestionItems } = useSelector((state) => state.adminSuggestion);
  const { items: themeItems } = useSelector((state) => state.theme);
  const { selectedMapping, detailLoading, detailError } = useSelector(
    (state) => state.kpiSuggestionMapping,
  );

  useEffect(() => {
    dispatch(fetchThemes({ limit: 500, isActive: true }));
    dispatch(fetchKpis({ limit: 100, isActive: true }));
    dispatch(fetchQuestions({ limit: 100, isActive: true }));
    dispatch(fetchAdminSuggestions({ limit: 100, is_active: true }));

    if (id) {
      dispatch(fetchKpiSuggestionMappingById(id));
    }

    return () => {
      dispatch(clearKpiSuggestionMappingDetailState());
    };
  }, [dispatch, id]);

  const themeNameByKey = useMemo(
    () =>
      themeItems.reduce((accumulator, item) => {
        accumulator[item.theme_key] = item.theme_display_name;
        return accumulator;
      }, {}),
    [themeItems],
  );

  const kpiLabel = useMemo(() => {
    const matchedKpi = kpiItems.find(
      (item) => item.kpi_key === selectedMapping?.kpi_key,
    );

    if (!matchedKpi) {
      return selectedMapping?.kpi_key || "-";
    }

    const themeName = themeNameByKey[matchedKpi.theme_key];
    return themeName
      ? `${themeName} - ${matchedKpi.display_name}`
      : matchedKpi.display_name;
  }, [kpiItems, selectedMapping?.kpi_key, themeNameByKey]);

  const questionLabel = useMemo(() => {
    const matchedQuestion = questionItems.find(
      (item) => item.id === selectedMapping?.question_key,
    );

    if (!matchedQuestion) {
      return selectedMapping?.question_key || "-";
    }

    return matchedQuestion.question_text
      ? `${matchedQuestion.question_code} - ${matchedQuestion.question_text}`
      : matchedQuestion.question_code;
  }, [questionItems, selectedMapping?.question_key]);

  const suggestionLabel = useMemo(() => {
    const matchedSuggestion = suggestionItems.find(
      (item) => item.id === selectedMapping?.suggestion_id,
    );

    return matchedSuggestion?.title || selectedMapping?.suggestion_id || "-";
  }, [selectedMapping?.suggestion_id, suggestionItems]);

  if (detailLoading) {
    return (
      <Layout role="superadmin" title="View KPI Suggestion Mapping">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: getSurfaceBackground(theme),
          }}
        >
          <Typography>Loading mapping...</Typography>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout role="superadmin" title="View KPI Suggestion Mapping">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: getSurfaceBackground(theme),
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 750 }}>
              KPI Suggestion Mapping Details
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Review the full mapping rule before making changes.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate("/super-admin/kpi-suggestion-mapping")}
            >
              Back to list
            </Button>
            <Button
              variant="contained"
              startIcon={<EditRoundedIcon />}
              onClick={() => navigate(`/super-admin/kpi-suggestion-mapping/${id}/edit`)}
            >
              Edit
            </Button>
          </Stack>
        </Stack>

        {detailError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {detailError}
          </Alert>
        )}

        {selectedMapping && !detailError && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            {[
              ["KPI", kpiLabel],
              ["Trigger Mode", selectedMapping.trigger_mode],
              ["Risk Level", selectedMapping.risk_level || "-"],
              ["Question", questionLabel],
              [
                "Score Threshold Below",
                selectedMapping.score_threshold_below ?? "-",
              ],
              [
                "Score Threshold Above",
                selectedMapping.score_threshold_above ?? "-",
              ],
              ["KPI Score Below", selectedMapping.kpi_score_below ?? "-"],
              ["Suggestion", suggestionLabel],
              ["Priority", selectedMapping.priority],
              [
                "Created At",
                formatDateTimeIST(selectedMapping.created_at),
              ],
              [
                "Updated At",
                formatDateTimeIST(selectedMapping.updated_at),
              ],
            ].map(([label, value]) => (
              <Paper key={label} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography sx={{ mt: 0.8, fontWeight: 600, wordBreak: "break-word" }}>
                  {value || "-"}
                </Typography>
              </Paper>
            ))}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={selectedMapping.is_active ? "Active" : "Inactive"}
                  color={selectedMapping.is_active ? "success" : "default"}
                  variant={selectedMapping.is_active ? "filled" : "outlined"}
                />
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    </Layout>
  );
}
