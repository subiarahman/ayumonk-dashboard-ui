import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
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
import {
  clearThemeCreateState,
  clearThemeDetailState,
  clearThemeUpdateState,
  createTheme,
  fetchThemeById,
  updateTheme,
} from "../../store/themeSlice";
import { getSurfaceBackground } from "../../theme";

export default function ThemeForm({ mode }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    selectedTheme,
    createLoading,
    createError,
    detailLoading,
    detailError,
    updateLoading,
    updateError,
  } = useSelector((state) => state.theme);
  const [themeDisplayName, setThemeDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (mode === "edit" && id) {
      dispatch(fetchThemeById(id));
    }
  }, [dispatch, id, mode]);

  useEffect(() => {
    if (mode === "edit" && selectedTheme) {
      setThemeDisplayName(selectedTheme.theme_display_name || "");
      setDescription(selectedTheme.description || "");
      setDurationDays(
        selectedTheme.duration_days === null || selectedTheme.duration_days === undefined
          ? ""
          : String(selectedTheme.duration_days),
      );
      setTargetAudience(selectedTheme.target_audience || "");
      setIsActive(Boolean(selectedTheme.is_active));
    }
  }, [mode, selectedTheme]);

  useEffect(() => {
    return () => {
      dispatch(clearThemeCreateState());
      dispatch(clearThemeUpdateState());
      dispatch(clearThemeDetailState());
    };
  }, [dispatch]);

  const pageTitle = useMemo(
    () => (mode === "edit" ? "Edit Theme" : "Add Theme"),
    [mode],
  );

  const handleSave = async () => {
    if (!themeDisplayName.trim()) {
      setFormError("Theme name is required.");
      return;
    }

    setFormError("");

    try {
      if (mode === "edit") {
        await dispatch(
          updateTheme({
            themeKey: id,
            themeDisplayName: themeDisplayName.trim(),
            description: description.trim(),
            durationDays: durationDays === "" ? null : Number(durationDays),
            targetAudience: targetAudience.trim(),
            isActive,
          }),
        ).unwrap();
        navigate("/admin/themes", {
          replace: true,
          state: {
            feedback: {
              severity: "success",
              message: "Theme updated successfully.",
            },
          },
        });
        return;
      }

      await dispatch(
        createTheme({
          themeDisplayName: themeDisplayName.trim(),
          description: description.trim(),
          durationDays: durationDays === "" ? null : Number(durationDays),
          targetAudience: targetAudience.trim(),
        }),
      ).unwrap();
      navigate("/admin/themes", {
        replace: true,
        state: {
          feedback: {
            severity: "success",
            message: "Theme added successfully.",
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
          <Typography>Loading theme...</Typography>
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
                ? "Update the theme details below."
                : "Create a new theme using the API-backed form."}
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/admin/themes")}
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
          <TextField
            label="Theme Name"
            value={themeDisplayName}
            onChange={(event) => {
              setFormError("");
              setThemeDisplayName(event.target.value);
            }}
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            label="Duration Days"
            type="number"
            inputProps={{ min: 0 }}
            value={durationDays}
            onChange={(event) => setDurationDays(event.target.value)}
            fullWidth
          />
          <TextField
            label="Target Audience"
            value={targetAudience}
            onChange={(event) => setTargetAudience(event.target.value)}
            fullWidth
          />

          {mode === "edit" && (
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
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
          <Button variant="outlined" onClick={() => navigate("/admin/themes")}>
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Layout>
  );
}
