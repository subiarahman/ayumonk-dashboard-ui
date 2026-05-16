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
import { alpha } from "@mui/material/styles";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Layout from "../../layouts/commonLayout/Layout";
import {
  clearPermissionMasterDetailState,
  clearSelectedPermissionMaster,
  fetchPermissionMasterById,
} from "../../store/permissionMasterSlice";
import usePermissions from "../../hooks/usePermissions";
import { getSurfaceBackground } from "../../theme";

export default function PermissionView() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedPermission, detailLoading, detailError } = useSelector(
    (state) => state.permissionMaster,
  );
  const { canEdit } = usePermissions();
  const canEditPermissions = canEdit("permissions");

  useEffect(() => {
    if (id) {
      dispatch(fetchPermissionMasterById(id));
    }
    return () => {
      dispatch(clearSelectedPermissionMaster());
      dispatch(clearPermissionMasterDetailState());
    };
  }, [dispatch, id]);

  const permission =
    selectedPermission && String(selectedPermission.id) === String(id)
      ? selectedPermission
      : null;

  return (
    <Layout role="superadmin" title="View Permission">
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
              Permission Details
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Review the full permission record.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate("/super-admin/permissions")}
            >
              Back to list
            </Button>
            {canEditPermissions && (
              <Button
                variant="contained"
                startIcon={<EditRoundedIcon />}
                onClick={() => navigate(`/super-admin/permissions/${id}/edit`)}
              >
                Edit
              </Button>
            )}
          </Stack>
        </Stack>

        {detailError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {detailError}
          </Alert>
        )}

        {detailLoading && !permission && (
          <Typography>Loading permission...</Typography>
        )}

        {permission && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                ID
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {permission.id || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Name
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {permission.name || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Codename
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={permission.codename || "-"}
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: "primary.main",
                  }}
                />
              </Box>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Module
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {permission.module || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Action
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {permission.action || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Resource
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {permission.resource || "-"}
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>
    </Layout>
  );
}
