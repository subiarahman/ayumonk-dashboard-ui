import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  TextField,
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
import {
  clearQuestionDeleteState,
  clearQuestionListError,
  clearQuestionUploadError,
  deleteQuestion,
  fetchQuestions,
  resetQuestionUpload,
  uploadQuestionFile,
} from "../../store/questionSlice";
import { fetchThemes } from "../../store/themeSlice";
import { fetchKpis } from "../../store/kpiSlice";
import { getSurfaceBackground } from "../../theme";
import { downloadTemplateFile } from "../../utils/downloadTemplate";

const filterFieldSx = {
  "& .MuiInputBase-root": {
    minHeight: 56,
  },
};

export default function Questions({ role = "admin" }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const feedback = location.state?.feedback;
  const fileInputRef = useRef(null);
  const { items: themeItems } = useSelector((state) => state.theme);
  const { items: kpiItems } = useSelector((state) => state.kpi);
  const {
    items,
    total,
    listLoading,
    listError,
    deleteLoading,
    deleteError,
    deleteMessage,
    uploadLoading,
    uploadError,
    uploadStatus,
  } = useSelector((state) => state.question);
  const [filters, setFilters] = useState({
    themeKey: "",
    kpiKey: "",
    search: "",
    status: "all",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    themeKey: "",
    kpiKey: "",
    search: "",
    status: "all",
  });
  const [uploadFeedback, setUploadFeedback] = useState(null);

  const isActive =
    appliedFilters.status === "all"
      ? undefined
      : appliedFilters.status === "active";

  useEffect(() => {
    dispatch(fetchThemes({ isActive: true }));
    dispatch(fetchKpis({ isActive: true }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchQuestions({
        skip: 0,
        limit: 50,
        themeKey: appliedFilters.themeKey,
        kpiKey: appliedFilters.kpiKey,
        search: appliedFilters.search,
        isActive,
      }),
    );
  }, [
    appliedFilters.kpiKey,
    appliedFilters.search,
    appliedFilters.themeKey,
    dispatch,
    isActive,
  ]);

  useEffect(() => {
    return () => {
      dispatch(clearQuestionListError());
      dispatch(clearQuestionDeleteState());
      dispatch(resetQuestionUpload());
    };
  }, [dispatch]);

  const filteredKpis = useMemo(
    () =>
      filters.themeKey
        ? kpiItems.filter((item) => item.theme_key === filters.themeKey)
        : kpiItems,
    [filters.themeKey, kpiItems],
  );

  const themeNameByKey = useMemo(
    () =>
      themeItems.reduce((accumulator, item) => {
        accumulator[item.theme_key] = item.theme_display_name;
        return accumulator;
      }, {}),
    [themeItems],
  );

  const kpiNameByKey = useMemo(
    () =>
      kpiItems.reduce((accumulator, item) => {
        accumulator[item.kpi_key] = item.display_name;
        return accumulator;
      }, {}),
    [kpiItems],
  );

  const handleDelete = useCallback(async (questionId, questionCode) => {
    if (!window.confirm(`Delete question "${questionCode}"?`)) return;

    try {
      await dispatch(deleteQuestion(questionId)).unwrap();
    } catch {
      // Redux state already stores the error.
    }
  }, [dispatch]);

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    dispatch(resetQuestionUpload());
    setUploadFeedback(null);

    try {
      await dispatch(uploadQuestionFile(file)).unwrap();
      await dispatch(
        fetchQuestions({
          skip: 0,
          limit: 50,
          themeKey: appliedFilters.themeKey,
          kpiKey: appliedFilters.kpiKey,
          search: appliedFilters.search,
          isActive,
        }),
      ).unwrap();
      setUploadFeedback({
        severity: "success",
        message: `Question file "${file.name}" uploaded successfully.`,
      });
    } catch {
      // Redux state already stores the error.
    }

    event.target.value = "";
  };

  const handleDownloadFormat = () => {
    downloadTemplateFile("templates/MasterData.xlsx", "MasterData.xlsx");
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      themeKey: filters.themeKey,
      kpiKey: filters.kpiKey,
      search: filters.search,
      status: filters.status,
    });
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      themeKey: "",
      kpiKey: "",
      search: "",
      status: "all",
    };

    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    dispatch(
      fetchQuestions({
        skip: 0,
        limit: 50,
        themeKey: "",
        kpiKey: "",
        search: "",
        isActive: undefined,
      }),
    );
  };

  const columns = useMemo(
    () => [
      {
        field: "question_code",
        headerName: "Question Code",
        minWidth: 170,
      },
      {
        field: "question_text",
        headerName: "Question",
        flex: 1.5,
        minWidth: 320,
      },
      {
        field: "theme_key",
        headerName: "Theme",
        minWidth: 220,
        valueGetter: (_, row) => themeNameByKey[row.theme_key] || row.theme_key,
      },
      {
        field: "kpi_key",
        headerName: "KPI",
        minWidth: 220,
        valueGetter: (_, row) => kpiNameByKey[row.kpi_key] || row.kpi_key,
      },
      {
        field: "reverse_code",
        headerName: "Reverse Code",
        minWidth: 130,
        renderCell: ({ value }) => (
          <Chip
            size="small"
            label={value ? "Yes" : "No"}
            color={value ? "warning" : "default"}
            variant={value ? "filled" : "outlined"}
          />
        ),
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
        field: "options",
        headerName: "Options",
        minWidth: 110,
        valueGetter: (_, row) => row.options?.length || 0,
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
                onClick={() =>
                  navigate(
                    role === "admin"
                      ? `/admin/questions/${row.id}`
                      : `/super-admin/questions/${row.id}`,
                  )
                }
              >
                <PreviewRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => navigate(`/super-admin/questions/${row.id}/edit`)}
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
                  onClick={() => handleDelete(row.id, row.question_code)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [deleteLoading, handleDelete, kpiNameByKey, navigate, role, themeNameByKey],
  );

  return (
    <Layout role={role} title="Question Bank">
      <Stack spacing={2}>
        {feedback && (
          <Alert severity={feedback.severity}>{feedback.message}</Alert>
        )}
        {listError && <Alert severity="error">{listError}</Alert>}
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
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 750 }}>
                Question Bank
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 0.75, maxWidth: 760 }}
              >
                Manage KPI questions with API-backed create, update, view, and
                delete operations.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {role === "superadmin" && (
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => navigate("/super-admin/questions/add")}
                >
                  Add Question
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<FileDownloadRoundedIcon />}
                onClick={handleDownloadFormat}
                sx={{ whiteSpace: "nowrap" }}
              >
                Download format
              </Button>
              {role === "superadmin" && (
                <Button
                  variant="outlined"
                  startIcon={<UploadFileRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLoading}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {uploadLoading ? "Uploading..." : "Import Excel"}
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={() =>
                  dispatch(
                    fetchQuestions({
                      skip: 0,
                      limit: 50,
                      themeKey: appliedFilters.themeKey,
                      kpiKey: appliedFilters.kpiKey,
                      search: appliedFilters.search,
                      isActive,
                    }),
                  )
                }
                disabled={listLoading}
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
                dispatch(clearQuestionUploadError());
              }
            }}
          />

          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              mb: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr)) auto auto",
              },
              alignItems: { lg: "end" },
            }}
          >
            <TextField
              label="Theme"
              select
              value={filters.themeKey}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  themeKey: event.target.value,
                  kpiKey:
                    current.kpiKey &&
                    !kpiItems.some(
                      (item) =>
                        item.kpi_key === current.kpiKey &&
                        item.theme_key === event.target.value,
                    )
                      ? ""
                      : current.kpiKey,
                }))
              }
              fullWidth
              sx={filterFieldSx}
            >
              <MenuItem value="">All Themes</MenuItem>
              {themeItems.map((item) => (
                <MenuItem key={item.theme_key} value={item.theme_key}>
                  {item.theme_display_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="KPI"
              select
              value={filters.kpiKey}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  kpiKey: event.target.value,
                }))
              }
              fullWidth
              sx={filterFieldSx}
            >
              <MenuItem value="">All KPIs</MenuItem>
              {filteredKpis.map((item) => (
                <MenuItem key={item.kpi_key} value={item.kpi_key}>
                  {item.display_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Search"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              fullWidth
              sx={filterFieldSx}
            />
            <TextField
              label="Status"
              select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              fullWidth
              sx={filterFieldSx}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
              {role === "superadmin" && (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleApplyFilters}
                    disabled={listLoading}
                    sx={{ minHeight: 56, px: 3, whiteSpace: "nowrap" }}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="text"
                    onClick={handleResetFilters}
                    sx={{ minHeight: 56, px: 2, whiteSpace: "nowrap" }}
                  >
                    Reset
                  </Button>
                </>
              )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {items.length} of {total} questions
          </Typography>

          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Box sx={{ height: 560, width: "max-content", minWidth: "100%" }}>
              <DataGrid
                rows={items}
                columns={columns}
                loading={listLoading}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
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
