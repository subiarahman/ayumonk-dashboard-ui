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
  clearMenuMasterDetailState,
  clearSelectedMenuMaster,
  fetchMenuById,
} from "../../store/menuMasterSlice";
import usePermissions from "../../hooks/usePermissions";
import { getSurfaceBackground } from "../../theme";

export default function MenuView() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedMenu, items, detailLoading, detailError } = useSelector(
    (state) => state.menuMaster,
  );
  const { canEdit } = usePermissions();
  const canEditMenus = canEdit("menus");

  useEffect(() => {
    if (id) {
      dispatch(fetchMenuById(id));
    }
    return () => {
      dispatch(clearSelectedMenuMaster());
      dispatch(clearMenuMasterDetailState());
    };
  }, [dispatch, id]);

  const menu =
    selectedMenu && String(selectedMenu.id) === String(id)
      ? selectedMenu
      : null;

  const parentName = menu?.parent_id
    ? items.find((item) => item.id === String(menu.parent_id))?.name ||
      `#${menu.parent_id}`
    : "—";

  return (
    <Layout role="superadmin" title="View Menu">
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
              Menu Details
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Review the full menu record.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate("/super-admin/menus")}
            >
              Back to list
            </Button>
            {canEditMenus && (
              <Button
                variant="contained"
                startIcon={<EditRoundedIcon />}
                onClick={() => navigate(`/super-admin/menus/${id}/edit`)}
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

        {detailLoading && !menu && <Typography>Loading menu...</Typography>}

        {menu && (
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
                {menu.id || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Name
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {menu.name || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Slug
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={menu.slug || "-"}
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
                Path
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {menu.path || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Parent Menu
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {parentName}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Icon
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {menu.icon || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Order
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {menu.order_no ?? 0}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={menu.is_active ? "Active" : "Inactive"}
                  color={menu.is_active ? "success" : "default"}
                  variant={menu.is_active ? "filled" : "outlined"}
                />
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    </Layout>
  );
}
