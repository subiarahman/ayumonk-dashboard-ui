import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Layout from "../../layouts/commonLayout/Layout";
import { fetchCompanies } from "../../store/companySlice";
import { fetchThemes } from "../../store/themeSlice";
import { clearKpiDetailState, fetchKpiById } from "../../store/kpiSlice";
import { getSurfaceBackground } from "../../theme";

export default function KpiView() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { companies } = useSelector((state) => state.company);
  const { items: themeItems } = useSelector((state) => state.theme);
  const { selectedKpi, detailLoading, detailError } = useSelector(
    (state) => state.kpi,
  );

  useEffect(() => {
    dispatch(fetchCompanies());
    if (id) {
      dispatch(fetchKpiById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!selectedKpi?.company_id) return;
    dispatch(fetchThemes({ companyId: selectedKpi.company_id }));
  }, [dispatch, selectedKpi?.company_id]);

  useEffect(() => {
    return () => {
      dispatch(clearKpiDetailState());
    };
  }, [dispatch]);

  const themeName = useMemo(
    () =>
      themeItems.find((item) => item.theme_key === selectedKpi?.theme_key)
        ?.theme_display_name ||
      selectedKpi?.theme_key ||
      "-",
    [selectedKpi?.theme_key, themeItems],
  );

  const companyName = useMemo(
    () =>
      companies.find((item) => item.id === selectedKpi?.company_id)
        ?.company_name ||
      selectedKpi?.company_id ||
      "-",
    [companies, selectedKpi?.company_id],
  );

  return (
    <Layout role="admin" title="View KPI">
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
              KPI Details
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Review the full KPI record before making changes.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate("/admin/kpis")}
            >
              Back to list
            </Button>
            <Button
              variant="contained"
              startIcon={<EditRoundedIcon />}
              onClick={() => navigate(`/admin/kpis/${id}/edit`)}
            >
              Edit
            </Button>
          </Stack>
        </Stack>

        {detailLoading && <Typography>Loading KPI...</Typography>}
        {detailError && <Alert severity="error">{detailError}</Alert>}

        {selectedKpi && !detailLoading && (
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
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Company
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {companyName}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                KPI Name
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {selectedKpi.display_name}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Theme
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {themeName}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Domain Category
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {selectedKpi.domain_category || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                WI Weight
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {selectedKpi.wi_weight ?? "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={selectedKpi.is_active ? "Active" : "Inactive"}
                  color={selectedKpi.is_active ? "success" : "default"}
                  variant={selectedKpi.is_active ? "filled" : "outlined"}
                />
              </Box>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Start Date
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {selectedKpi.start_date || "-"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                End Date
              </Typography>
              <Typography sx={{ mt: 0.8, fontWeight: 600 }}>
                {selectedKpi.end_date || "-"}
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>
    </Layout>
  );
}
