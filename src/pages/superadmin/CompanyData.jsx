import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Layout from "../../layouts/commonLayout/Layout";
import {
  clearCompanyDeleteState,
  clearCompanyError,
  fetchCompanies,
  deleteCompany,
} from "../../store/companySlice";
import { getSurfaceBackground } from "../../theme";
import { formatDateTimeIST } from "../../utils/dateTime";

export default function CompanyData() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const feedback = location.state?.feedback;
  const {
    companies,
    companiesLoading,
    error,
    deleteLoading,
    deleteError,
    deleteMessage,
  } = useSelector((state) => state.company);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearCompanyError());
      dispatch(clearCompanyDeleteState());
    };
  }, [dispatch]);

  const handleDelete = async (companyId, companyName) => {
    if (!window.confirm(`Delete company "${companyName}"?`)) return;

    try {
      await dispatch(deleteCompany(companyId)).unwrap();
    } catch {
      // Redux state already stores the error.
    }
  };

  const columns = useMemo(
    () => [
      {
        field: "company_name",
        headerName: "Company Name",
        flex: 1.2,
        minWidth: 220,
      },
      {
        field: "industry",
        headerName: "Industry",
        flex: 1,
        minWidth: 180,
      },
      {
        field: "size_bucket",
        headerName: "Size",
        minWidth: 120,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1.1,
        minWidth: 220,
      },
      {
        field: "phone",
        headerName: "Phone",
        minWidth: 150,
      },
      {
        field: "no_of_employees",
        headerName: "Employees",
        minWidth: 120,
      },
      {
        field: "is_active",
        headerName: "Status",
        minWidth: 120,
        renderCell: ({ value }) => (
          <Chip
            size="small"
            label={value ? "Active" : "Inactive"}
            color={value ? "success" : "default"}
            variant={value ? "filled" : "outlined"}
          />
        ),
      },
      {
        field: "updated_at",
        headerName: "Updated At",
        flex: 1,
        minWidth: 190,
        valueFormatter: (value) => formatDateTimeIST(value),
      },
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        filterable: false,
        minWidth: 170,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View">
              <IconButton
                size="small"
                onClick={() => navigate(`/super-admin/company-data/${row.id}`)}
              >
                <PreviewRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() =>
                  navigate(`/super-admin/company-data/${row.id}/edit`)
                }
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={deleteLoading}
                  onClick={() => handleDelete(row.id, row.company_name)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [deleteLoading, navigate],
  );

  return (
    <Layout role="superadmin" title="Company Data">
      <Stack spacing={2}>
        {feedback && (
          <Alert severity={feedback.severity}>{feedback.message}</Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {deleteError && <Alert severity="error">{deleteError}</Alert>}
        {deleteMessage && <Alert severity="success">{deleteMessage}</Alert>}

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
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 750 }}>
                Company Master
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 0.75, maxWidth: 720 }}
              >
                Super admin company management with API-backed create, update,
                delete, and company admin assignment.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="nowrap">
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => navigate("/super-admin/company-data/add")}
                sx={{
                  height: 40,
                  px: 2.5,
                  minWidth: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                Add Company
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => dispatch(fetchCompanies())}
                disabled={companiesLoading}
                sx={{
                  height: 40,
                  minWidth: 152,
                  px: 2,
                  py: 1.1,
                  whiteSpace: "nowrap",
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Total companies: {companies.length}
          </Typography>

          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Box sx={{ height: 560, width: "max-content", minWidth: "100%" }}>
              <DataGrid
                rows={companies}
                columns={columns}
                loading={companiesLoading}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                  sorting: {
                    sortModel: [{ field: "updated_at", sort: "desc" }],
                  },
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Layout>
  );
}
