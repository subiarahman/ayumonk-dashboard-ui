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
  clearRoleDetailState,
  clearSelectedRole,
  fetchRoleById,
} from "../../store/roleSlice";
import usePermissions from "../../hooks/usePermissions";
import { getSurfaceBackground } from "../../theme";

export default function RoleView() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedRole, detailLoading, detailError, selectedTenantId } =
    useSelector((state) => state.role);
  const { canEdit } = usePermissions();
  const canEditRoles = canEdit("roles");

  useEffect(() => {
    if (id && selectedTenantId) {
      dispatch(fetchRoleById({ roleId: id, tenantId: selectedTenantId }));
    }
    return () => {
      dispatch(clearSelectedRole());
      dispatch(clearRoleDetailState());
    };
  }, [dispatch, id, selectedTenantId]);

  const role = selectedRole && String(selectedRole.id) === String(id)
    ? selectedRole
    : null;

  const isProtectedRole = (() => {
    const normalized = String(role?.name || "")
      .trim()
      .toLowerCase()
      .replace(/[_\s-]+/g, "");
    return normalized === "companyadmin" || normalized === "employee";
  })();

  return (
    <Layout role="superadmin" title="View Role">
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
              Role Details
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Review the full role record.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate("/super-admin/roles")}
            >
              Back to list
            </Button>
            {canEditRoles && !isProtectedRole && (
              <Button
                variant="contained"
                startIcon={<EditRoundedIcon />}
                onClick={() => navigate(`/super-admin/roles/${id}/edit`)}
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

        {detailLoading && !role && (
          <Typography>Loading role...</Typography>
        )}

        {role && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Role ID
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {role.id || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Role Name
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {role.name || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Tenant ID
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {role.tenant_id || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={role.is_active ? "Active" : "Inactive"}
                  color={role.is_active ? "success" : "default"}
                  variant={role.is_active ? "filled" : "outlined"}
                />
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    </Layout>
  );
}
