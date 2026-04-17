import { useEffect, useMemo, useRef, useState } from "react";
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
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import Layout from "../../layouts/commonLayout/Layout";
import { fetchCompanies } from "../../store/companySlice";
import {
  clearUserDeleteState,
  clearUserError,
  deleteUser,
  fetchUsers,
} from "../../store/userSlice";
import {
  clearUserUploadError,
  resetUserUpload,
  uploadUserFile,
} from "../../store/userUploadSlice";
import { getSurfaceBackground } from "../../theme";
import { downloadTemplateFile } from "../../utils/downloadTemplate";
import { formatDateTimeIST } from "../../utils/dateTime";

export default function CompanyUsers() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const feedback = location.state?.feedback;
  const [uploadFeedback, setUploadFeedback] = useState(null);
  const {
    users,
    total,
    usersLoading,
    error,
    deleteLoading,
    deleteError,
    deleteMessage,
  } = useSelector((state) => state.user);
  const { companies } = useSelector((state) => state.company);
  const {
    loading: uploadLoading,
    error: uploadError,
    status: uploadStatus,
  } = useSelector((state) => state.userUpload);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCompanies());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearUserError());
      dispatch(clearUserDeleteState());
      dispatch(resetUserUpload());
    };
  }, [dispatch]);

  const companyNameById = useMemo(
    () =>
      companies.reduce((accumulator, company) => {
        accumulator[company.id] = company.company_name;
        return accumulator;
      }, {}),
    [companies],
  );

  const handleDelete = async (userId, fullName) => {
    if (!window.confirm(`Delete user "${fullName}"?`)) return;

    try {
      await dispatch(deleteUser(userId)).unwrap();
    } catch {
      // Redux state already stores the error.
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    dispatch(resetUserUpload());
    setUploadFeedback(null);

    try {
      await dispatch(uploadUserFile(file)).unwrap();
      await dispatch(fetchUsers()).unwrap();
      setUploadFeedback({
        severity: "success",
        message: `User file "${file.name}" uploaded successfully.`,
      });
    } catch {
      // Redux state already stores the error.
    }

    event.target.value = "";
  };

  const handleDownloadFormat = () => {
    downloadTemplateFile("templates/CompanyUserData.xlsx", "CompanyUserData.xlsx");
  };

  const columns = useMemo(
    () => [
      {
        field: "emp_id",
        headerName: "Employee ID",
        minWidth: 140,
      },
      {
        field: "full_name",
        headerName: "Full Name",
        flex: 1.1,
        minWidth: 220,
      },
      {
        field: "department",
        headerName: "Department",
        minWidth: 150,
      },
      {
        field: "location",
        headerName: "Location",
        minWidth: 150,
      },
      {
        field: "gender",
        headerName: "Gender",
        minWidth: 120,
      },
      {
        field: "age_band",
        headerName: "Age Band",
        minWidth: 120,
      },
      {
        field: "phone",
        headerName: "Phone",
        minWidth: 150,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1.1,
        minWidth: 240,
      },
      {
        field: "company_id",
        headerName: "Company",
        flex: 1,
        minWidth: 220,
        renderCell: ({ value }) => companyNameById[value] || value || "-",
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
                onClick={() => navigate(`/admin/company-users/${row.id}`)}
              >
                <PreviewRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => navigate(`/admin/company-users/${row.id}/edit`)}
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
                  onClick={() => handleDelete(row.id, row.full_name)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [companyNameById, deleteLoading, navigate],
  );

  return (
    <Layout role="admin" title="Company User Data">
      <Stack spacing={2}>
        {feedback && <Alert severity={feedback.severity}>{feedback.message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {deleteError && <Alert severity="error">{deleteError}</Alert>}
        {deleteMessage && <Alert severity="success">{deleteMessage}</Alert>}
        {uploadFeedback && (
          <Alert severity={uploadFeedback.severity}>{uploadFeedback.message}</Alert>
        )}
        {uploadStatus === "error" && uploadError && (
          <Alert severity="error">{uploadError}</Alert>
        )}

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
                Company Users
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
                Manage employee records with API-backed create, update, view, delete,
                and file upload.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => navigate("/admin/company-users/add")}
                sx={{ height: 40, px: 2.5, whiteSpace: "nowrap" }}
              >
                Add User
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadRoundedIcon />}
                onClick={handleDownloadFormat}
                sx={{ height: 40, px: 2, whiteSpace: "nowrap" }}
              >
                Download format
              </Button>
              <Button
                variant="outlined"
                startIcon={<UploadFileRoundedIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadLoading}
                sx={{ height: 40, px: 2, whiteSpace: "nowrap" }}
              >
                {uploadLoading ? "Uploading..." : "Import Excel"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => dispatch(fetchUsers())}
                disabled={usersLoading}
                sx={{ height: 40, px: 2, whiteSpace: "nowrap" }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          <input
            hidden
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImport}
            onClick={() => {
              if (uploadError) {
                dispatch(clearUserUploadError());
              }
            }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Total users: {total || users.length}
          </Typography>

          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Box sx={{ height: 560, width: "max-content", minWidth: "100%" }}>
              <DataGrid
                rows={users}
                columns={columns}
                loading={usersLoading}
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
