import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DataGrid } from "@mui/x-data-grid";
import { getSurfaceBackground } from "../../theme";

const getColumns = (rows) => {
  if (!rows.length) return [];
  return Object.keys(rows[0]).map((key) => ({
    field: key,
    headerName: key,
    flex: 1,
    minWidth: 130,
    renderCell: (params) => {
      const value = params?.value;
      const displayValue = value === null || value === undefined ? "-" : String(value);
      return (
        <Tooltip title={displayValue}>
          <Typography variant="body2" noWrap sx={{ width: "100%" }}>
            {displayValue}
          </Typography>
        </Tooltip>
      );
    },
  }));
};

export default function ExcelUploadGrid({
  title,
  description,
  uploadSelector,
  uploadThunk,
  resetUploadAction,
  clearUploadErrorAction,
}) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { loading: uploading, status: uploadStatus, error: uploadError, responseData } =
    useSelector(uploadSelector);
  const [rows, setRows] = useState([]);

  const columns = useMemo(() => getColumns(rows), [rows]);

  const handleRefreshTable = () => {
    setRows([]);
    dispatch(resetUploadAction());
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    dispatch(resetUploadAction());

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsed = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const normalized = parsed.map((item, index) => ({
        id: index + 1,
        ...item,
      }));
      setRows(normalized);
    };
    reader.readAsArrayBuffer(file);

    try {
      await dispatch(uploadThunk(file)).unwrap();
    } catch {
      // Error state is handled in redux slice.
    }
  };

  return (
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
      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 750 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileIcon />}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Excel"}
          <input
            hidden
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleUpload}
            onClick={() => {
              if (uploadError && clearUploadErrorAction) {
                dispatch(clearUploadErrorAction());
              }
            }}
          />
        </Button>

        <Tooltip title="Refresh Table">
          <IconButton onClick={handleRefreshTable} size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {uploadStatus === "success" && (
        <Alert severity="success" sx={{ mb: 2 }}>
          File uploaded successfully.
        </Alert>
      )}
      {uploadStatus === "error" && !!uploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uploadError}
        </Alert>
      )}

      {!!responseData && (
        <Paper variant="outlined" sx={{ mb: 2, p: 1.5, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
            Upload Summary
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(responseData, null, 2)}
          </Typography>
        </Paper>
      )}

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box sx={{ height: 470, width: "max-content", minWidth: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
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
  );
}
