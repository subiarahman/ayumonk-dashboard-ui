import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import {
  clearThemeDetailState,
  fetchThemeById,
} from "../../store/themeSlice";
import usePermissions from "../../hooks/usePermissions";
import { getSurfaceBackground } from "../../theme";
import { formatDateTimeIST } from "../../utils/dateTime";

export default function ThemeView({ role = "admin" }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedTheme, detailLoading, detailError } = useSelector(
    (state) => state.theme,
  );
  const { canEdit } = usePermissions();
  const canEditThemes = canEdit("themes");

  useEffect(() => {
    if (id) {
      dispatch(fetchThemeById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    return () => {
      dispatch(clearThemeDetailState());
    };
  }, [dispatch]);

  const backPath = role === "admin" ? "/admin/themes" : "/super-admin/themes";

  return (
    <Layout role={role} title="View Theme">
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
              Theme Details
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Review the full theme record before making changes.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(backPath)}>
              Back to list
            </Button>
            {canEditThemes && (
              <Button
                variant="contained"
                startIcon={<EditRoundedIcon />}
                onClick={() =>
                  navigate(
                    role === "admin"
                      ? `/admin/themes/${id}/edit`
                      : `/super-admin/themes/${id}/edit`,
                  )
                }
              >
                Edit
              </Button>
            )}
          </Stack>
        </Stack>

        {detailLoading && <Typography>Loading theme...</Typography>}
        {detailError && <Alert severity="error">{detailError}</Alert>}

        {selectedTheme && !detailLoading && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            {/* <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Theme Key
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {selectedTheme.theme_key}
              </Typography>
            </Paper> */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Theme Name
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {selectedTheme.theme_display_name}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {selectedTheme.description || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Duration (Days)
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {selectedTheme.duration_days ?? "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Target Audience
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {selectedTheme.target_audience || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={selectedTheme.is_active ? "Active" : "Inactive"}
                  color={selectedTheme.is_active ? "success" : "default"}
                  variant={selectedTheme.is_active ? "filled" : "outlined"}
                />
              </Box>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Created At
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {formatDateTimeIST(selectedTheme.created_at)}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Updated At
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {formatDateTimeIST(selectedTheme.updated_at)}
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>
    </Layout>
  );
}
