import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Layout from "../../layouts/commonLayout/Layout";
import { fetchAdminSuggestions } from "../../store/adminSuggestionSlice";
import { fetchKpis } from "../../store/kpiSlice";
import {
  clearKpiSuggestionMappingCreateState,
  clearKpiSuggestionMappingDetailState,
  clearKpiSuggestionMappingUpdateState,
  createKpiSuggestionMapping,
  fetchKpiSuggestionMappingById,
  updateKpiSuggestionMapping,
} from "../../store/kpiSuggestionMappingSlice";
import { fetchQuestions } from "../../store/questionSlice";
import { fetchThemes } from "../../store/themeSlice";
import { getSurfaceBackground } from "../../theme";

const triggerModeOptions = [
  { value: "kpi_risk", label: "KPI Risk" },
  { value: "question_score", label: "Question Score" },
  { value: "both", label: "Both" },
];

const riskLevelOptions = [
  { value: "good", label: "Good" },
  { value: "moderate", label: "Moderate" },
  { value: "risk", label: "Risk" },
];

const defaultFormValues = {
  kpi_key: "",
  trigger_mode: "kpi_risk",
  risk_level: "",
  question_key: "",
  score_threshold_below: "",
  score_threshold_above: "",
  kpi_score_below: "",
  suggestion_id: "",
  priority: 1,
  is_active: true,
};

const normalizeFormValues = (item) => ({
  kpi_key: item?.kpi_key || "",
  trigger_mode: item?.trigger_mode || "",
  risk_level: item?.risk_level || "",
  question_key: item?.question_key || "",
  score_threshold_below:
    item?.score_threshold_below === null || item?.score_threshold_below === undefined
      ? ""
      : String(item.score_threshold_below),
  score_threshold_above:
    item?.score_threshold_above === null || item?.score_threshold_above === undefined
      ? ""
      : String(item.score_threshold_above),
  kpi_score_below:
    item?.kpi_score_below === null || item?.kpi_score_below === undefined
      ? ""
      : String(item.kpi_score_below),
  suggestion_id: item?.suggestion_id || "",
  priority: item?.priority ?? 1,
  is_active: item?.is_active ?? true,
});

const toNullableNumber = (value) =>
  value === "" || value === null || value === undefined ? null : Number(value);

const buildPayload = (values) => ({
  kpi_key: values.kpi_key.trim(),
  trigger_mode: values.trigger_mode.trim(),
  risk_level:
    values.trigger_mode === "question_score"
      ? null
      : values.risk_level.trim() || null,
  question_key:
    values.trigger_mode === "kpi_risk"
      ? null
      : values.question_key.trim() || null,
  score_threshold_below: toNullableNumber(values.score_threshold_below),
  score_threshold_above: toNullableNumber(values.score_threshold_above),
  kpi_score_below: toNullableNumber(values.kpi_score_below),
  suggestion_id: values.suggestion_id.trim(),
  priority: Number(values.priority || 1),
  is_active: Boolean(values.is_active),
});

const validate = (values, suggestionItems) => {
  if (!values.kpi_key.trim()) return "KPI key is required.";
  if (!values.trigger_mode.trim()) return "Trigger mode is required.";
  if (!values.suggestion_id.trim()) return "Suggestion is required.";

  const suggestionExists = suggestionItems.some(
    (item) => String(item.id) === values.suggestion_id.trim(),
  );
  if (!suggestionExists) {
    return "Please select a valid suggestion.";
  }

  const hasBelowThreshold =
    values.score_threshold_below !== "" &&
    values.score_threshold_below !== null &&
    values.score_threshold_below !== undefined;
  const hasAboveThreshold =
    values.score_threshold_above !== "" &&
    values.score_threshold_above !== null &&
    values.score_threshold_above !== undefined;

  if (!hasBelowThreshold && !hasAboveThreshold) {
    return "At least one threshold is required.";
  }

  if (values.trigger_mode === "kpi_risk") {
    if (!values.risk_level.trim()) {
      return "Risk level is required when trigger mode is KPI Risk.";
    }

    if (values.question_key.trim()) {
      return "Question must be empty when trigger mode is KPI Risk.";
    }
  }

  if (values.trigger_mode === "question_score") {
    if (!values.question_key.trim()) {
      return "Question is required when trigger mode is Question Score.";
    }
  }

  if (values.trigger_mode === "both") {
    if (!values.risk_level.trim()) {
      return "Risk level is required when trigger mode is Both.";
    }

    if (!values.question_key.trim()) {
      return "Question is required when trigger mode is Both.";
    }
  }

  const priority = Number(values.priority);
  if (!Number.isFinite(priority) || priority < 1) {
    return "Priority must be 1 or more.";
  }

  return "";
};

export default function KpiSuggestionMappingForm({ mode }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { items: kpiItems } = useSelector((state) => state.kpi);
  const { items: questionItems } = useSelector((state) => state.question);
  const { items: suggestionItems } = useSelector((state) => state.adminSuggestion);
  const { items: themeItems } = useSelector((state) => state.theme);
  const {
    selectedMapping,
    detailLoading,
    detailError,
    createLoading,
    createError,
    updateLoading,
    updateError,
  } = useSelector((state) => state.kpiSuggestionMapping);
  const isEdit = mode === "edit";
  const [draftFormValues, setDraftFormValues] = useState(defaultFormValues);
  const [hasStartedEditing, setHasStartedEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const formValues = useMemo(() => {
    if (isEdit && selectedMapping && !hasStartedEditing) {
      return normalizeFormValues(selectedMapping);
    }

    return draftFormValues;
  }, [draftFormValues, hasStartedEditing, isEdit, selectedMapping]);
  const needsRiskLevel =
    formValues.trigger_mode === "kpi_risk" || formValues.trigger_mode === "both";
  const needsQuestionKey =
    formValues.trigger_mode === "question_score" || formValues.trigger_mode === "both";

  const isSubmitting = createLoading || updateLoading;
  const pageTitle = useMemo(
    () => (isEdit ? "Edit KPI Suggestion Mapping" : "Add KPI Suggestion Mapping"),
    [isEdit],
  );

  useEffect(() => {
    dispatch(fetchThemes({ limit: 100, isActive: true }));
    dispatch(fetchKpis({ limit: 100, isActive: true }));
    dispatch(fetchQuestions({ limit: 100, isActive: true }));
    dispatch(fetchAdminSuggestions({ limit: 100, is_active: true }));

    if (isEdit && id) {
      dispatch(fetchKpiSuggestionMappingById(id));
    }

    return () => {
      dispatch(clearKpiSuggestionMappingCreateState());
      dispatch(clearKpiSuggestionMappingUpdateState());
      dispatch(clearKpiSuggestionMappingDetailState());
    };
  }, [dispatch, id, isEdit]);

  const handleChange = (field, value) => {
    setHasStartedEditing(true);
    setDraftFormValues((current) => {
      const nextValues = {
        ...current,
        [field]: value,
      };

      if (field === "trigger_mode") {
        if (value === "kpi_risk") {
          nextValues.question_key = "";
        }
        if (value === "question_score") {
          nextValues.risk_level = "";
        }
      }

      if (field === "kpi_key") {
        nextValues.question_key =
          current.question_key &&
          !questionItems.some(
            (item) =>
              item.id === current.question_key &&
              item.kpi_key === value,
          )
            ? ""
            : current.question_key;
      }

      return nextValues;
    });
    setFormError("");
  };

  const questionDropdownItems = useMemo(() => {
    if (!formValues.kpi_key) {
      return questionItems;
    }

    return questionItems.filter((item) => item.kpi_key === formValues.kpi_key);
  }, [formValues.kpi_key, questionItems]);

  const themeNameByKey = useMemo(
    () =>
      themeItems.reduce((accumulator, item) => {
        accumulator[item.theme_key] = item.theme_display_name;
        return accumulator;
      }, {}),
    [themeItems],
  );

  const handleSave = async () => {
    const nextError = validate(formValues, suggestionItems);
    if (nextError) {
      setFormError(nextError);
      return;
    }

    try {
      if (isEdit) {
        await dispatch(
          updateKpiSuggestionMapping({
            mappingId: id,
            mapping: buildPayload(formValues),
          }),
        ).unwrap();
      } else {
        await dispatch(createKpiSuggestionMapping(buildPayload(formValues))).unwrap();
      }

      navigate("/super-admin/kpi-suggestion-mapping", {
        replace: true,
        state: {
          feedback: {
            severity: "success",
            message: isEdit
              ? "KPI suggestion mapping updated successfully."
              : "KPI suggestion mapping created successfully.",
          },
        },
      });
    } catch {
      // Redux state already stores the error.
    }
  };

  if (isEdit && detailLoading) {
    return (
      <Layout role="superadmin" title={pageTitle}>
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
    <Layout role="superadmin" title={pageTitle}>
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
              {pageTitle}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Configure KPI trigger rules, thresholds, and suggestion targeting.
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/super-admin/kpi-suggestion-mapping")}
          >
            Back to list
          </Button>
        </Stack>

        {(formError || detailError || createError || updateError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError || detailError || createError || updateError}
          </Alert>
        )}

        <Stack spacing={3}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <TextField
              label="KPI"
              select
              value={formValues.kpi_key}
              onChange={(event) => handleChange("kpi_key", event.target.value)}
              fullWidth
            >
              <MenuItem value="">Select KPI</MenuItem>
              {kpiItems.map((item) => (
                <MenuItem key={item.kpi_key} value={item.kpi_key}>
                  {`${themeNameByKey[item.theme_key] || item.theme_key || "Unknown Theme"} - ${item.display_name}`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Trigger Mode"
              select
              value={formValues.trigger_mode}
              onChange={(event) => handleChange("trigger_mode", event.target.value)}
              fullWidth
              helperText="kpi_risk = KPI band, question_score = specific question, both = both conditions."
            >
              {triggerModeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Risk Level"
              select
              value={formValues.risk_level}
              onChange={(event) => handleChange("risk_level", event.target.value)}
              fullWidth
              disabled={!needsRiskLevel}
              helperText={
                needsRiskLevel
                  ? "Required for kpi_risk and both."
                  : "Not used when trigger mode is question_score only."
              }
            >
              <MenuItem value="">Select Risk Level</MenuItem>
              {riskLevelOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Question"
              select
              value={formValues.question_key}
              onChange={(event) => handleChange("question_key", event.target.value)}
              fullWidth
              disabled={!needsQuestionKey}
              helperText={
                needsQuestionKey
                  ? "Required for question_score and both."
                  : "Not used when trigger mode is kpi_risk only."
              }
            >
              <MenuItem value="">Select Question</MenuItem>
              {questionDropdownItems.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.question_code}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Score Threshold Below"
              type="number"
              value={formValues.score_threshold_below}
              onChange={(event) =>
                handleChange("score_threshold_below", event.target.value)
              }
              fullWidth
              helperText="Fires when question final score is below this value."
            />
            <TextField
              label="Score Threshold Above"
              type="number"
              value={formValues.score_threshold_above}
              onChange={(event) =>
                handleChange("score_threshold_above", event.target.value)
              }
              fullWidth
              helperText="Fires when question final score is above this value."
            />
            <TextField
              label="KPI Score Below"
              type="number"
              value={formValues.kpi_score_below}
              onChange={(event) => handleChange("kpi_score_below", event.target.value)}
              fullWidth
              helperText="Optional combined precision trigger. Leave blank to ignore."
            />
            <TextField
              label="Suggestion"
              select
              value={formValues.suggestion_id}
              onChange={(event) => handleChange("suggestion_id", event.target.value)}
              fullWidth
              helperText="Suggestion to serve when all trigger conditions are met."
            >
              <MenuItem value="">Select Suggestion</MenuItem>
              {suggestionItems.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Priority"
              type="number"
              value={formValues.priority}
              onChange={(event) => handleChange("priority", event.target.value)}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formValues.is_active}
                onChange={(event) => handleChange("is_active", event.target.checked)}
              />
            }
            label={formValues.is_active ? "Mapping is active" : "Mapping is inactive"}
          />

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Mapping"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/super-admin/kpi-suggestion-mapping")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Layout>
  );
}
