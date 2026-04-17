import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import { fetchThemes } from "../../store/themeSlice";
import {
  clearKpiCreateState,
  clearKpiDetailState,
  clearKpiUpdateState,
  createKpi,
  fetchKpiById,
  updateKpi,
} from "../../store/kpiSlice";
import { getSurfaceBackground } from "../../theme";

const today = new Date().toISOString().slice(0, 10);

export default function KpiForm({ mode }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { items: themeItems } = useSelector((state) => state.theme);
  const {
    selectedKpi,
    createLoading,
    createError,
    detailLoading,
    detailError,
    updateLoading,
    updateError,
  } = useSelector((state) => state.kpi);
  const [form, setForm] = useState({
    displayName: "",
    themeKey: "",
    domainCategory: "",
    wiWeight: "",
    startDate: today,
    endDate: today,
    isActive: true,
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchThemes());
    if (mode === "edit" && id) {
      dispatch(fetchKpiById(id));
    }
  }, [dispatch, id, mode]);

  useEffect(() => {
    if (mode === "edit" && selectedKpi) {
      setForm({
        displayName: selectedKpi.display_name || "",
        themeKey: selectedKpi.theme_key || "",
        domainCategory: selectedKpi.domain_category || "",
        wiWeight:
          selectedKpi.wi_weight === null || selectedKpi.wi_weight === undefined
            ? ""
            : String(selectedKpi.wi_weight),
        startDate: selectedKpi.start_date || today,
        endDate: selectedKpi.end_date || today,
        isActive: Boolean(selectedKpi.is_active),
      });
    }
  }, [mode, selectedKpi]);

  useEffect(() => {
    return () => {
      dispatch(clearKpiCreateState());
      dispatch(clearKpiUpdateState());
      dispatch(clearKpiDetailState());
    };
  }, [dispatch]);

  const pageTitle = useMemo(
    () => (mode === "edit" ? "Edit KPI" : "Add KPI"),
    [mode],
  );

  const handleSave = async () => {
    if (
      !form.displayName.trim() ||
      !form.themeKey ||
      !form.startDate ||
      !form.endDate
    ) {
      setFormError("Theme, KPI name, start date, and end date are required.");
      return;
    }
    if (form.startDate > form.endDate) {
      setFormError("End date must be on or after the start date.");
      return;
    }

    setFormError("");

    try {
      if (mode === "edit") {
        await dispatch(
          updateKpi({
            kpiKey: id,
            displayName: form.displayName.trim(),
            themeKey: form.themeKey,
            domainCategory: form.domainCategory.trim(),
            wiWeight: form.wiWeight === "" ? null : Number(form.wiWeight),
            startDate: form.startDate,
            endDate: form.endDate,
            isActive: form.isActive,
          }),
        ).unwrap();
        navigate("/admin/kpis", {
          replace: true,
          state: {
            feedback: {
              severity: "success",
              message: "KPI updated successfully.",
            },
          },
        });
        return;
      }

      await dispatch(
        createKpi({
          displayName: form.displayName.trim(),
          themeKey: form.themeKey,
          domainCategory: form.domainCategory.trim(),
          wiWeight: form.wiWeight === "" ? null : Number(form.wiWeight),
          startDate: form.startDate,
          endDate: form.endDate,
        }),
      ).unwrap();
      navigate("/admin/kpis", {
        replace: true,
        state: {
          feedback: {
            severity: "success",
            message: "KPI added successfully.",
          },
        },
      });
    } catch {
      // Error is already handled in redux state.
    }
  };

  if (mode === "edit" && detailLoading) {
    return (
      <Layout role="admin" title={pageTitle}>
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
          <Typography>Loading KPI...</Typography>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout role="admin" title={pageTitle}>
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
              {mode === "edit"
                ? "Update the KPI details below."
                : "Create a new KPI using the API-backed form."}
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/admin/kpis")}
          >
            Back to list
          </Button>
        </Stack>

        {(formError || createError || updateError || detailError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError || createError || updateError || detailError}
          </Alert>
        )}

        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Theme"
              value={form.themeKey}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  themeKey: event.target.value,
                }))
              }
              select
              fullWidth
            >
              <MenuItem value="">Select Theme</MenuItem>
              {themeItems.map((theme) => (
                <MenuItem key={theme.theme_key} value={theme.theme_key}>
                  {theme.theme_display_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="KPI Name"
              value={form.displayName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  displayName: event.target.value,
                }))
              }
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Domain Category"
              value={form.domainCategory}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  domainCategory: event.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="WI Weight"
              type="number"
              inputProps={{ min: 0 }}
              value={form.wiWeight}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  wiWeight: event.target.value,
                }))
              }
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          {mode === "edit" && (
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />
              }
              label="Active"
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={handleSave}
            disabled={createLoading || updateLoading}
          >
            {createLoading || updateLoading ? "Saving..." : "Save"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/kpis")}>
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Layout>
  );
}
