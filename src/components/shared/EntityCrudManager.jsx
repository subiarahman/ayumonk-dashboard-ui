import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { DataGrid } from "@mui/x-data-grid";
import { getSurfaceBackground } from "../../theme";

const buildEmptyForm = (fields) =>
  fields.reduce((accumulator, field) => {
    accumulator[field.name] = "";
    return accumulator;
  }, {});

const normalizeImportedRows = (rows) =>
  rows.map((row, index) => ({
    id: String(row.id || row.ID || index + 1),
    ...row,
  }));

export default function EntityCrudManager({
  title,
  description,
  entityLabel,
  fields,
  initialRows,
}) {
  const theme = useTheme();
  const [rows, setRows] = useState(initialRows);
  const [formMode, setFormMode] = useState("add");
  const [formOpen, setFormOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [viewRow, setViewRow] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [formData, setFormData] = useState(() => buildEmptyForm(fields));
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  const columns = useMemo(() => {
    const baseColumns = fields.map((field) => ({
      field: field.name,
      headerName: field.label,
      flex: field.flex || 1,
      minWidth: field.minWidth || 150,
      renderCell: (params) => {
        const value = params.value;
        const displayValue =
          value === null || value === undefined || value === "" ? "-" : String(value);

        return (
          <Tooltip title={displayValue}>
            <Typography variant="body2" noWrap sx={{ width: "100%" }}>
              {displayValue}
            </Typography>
          </Tooltip>
        );
      },
    }));

    return [
      ...baseColumns,
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        filterable: false,
        minWidth: 130,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View">
              <IconButton size="small" onClick={() => setViewRow(params.row)}>
                <PreviewRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => {
                  setFormMode("edit");
                  setEditingRowId(params.row.id);
                  setFormData(
                    fields.reduce((accumulator, field) => {
                      accumulator[field.name] = params.row[field.name] ?? "";
                      return accumulator;
                    }, {}),
                  );
                  setFormErrors({});
                  setFormOpen(true);
                }}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ];
  }, [fields]);

  const handleOpenAdd = () => {
    setFormMode("add");
    setEditingRowId(null);
    setFormData(buildEmptyForm(fields));
    setFormErrors({});
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setFormErrors({});
  };

  const validateForm = () => {
    const nextErrors = {};

    fields.forEach((field) => {
      if (field.required && !String(formData[field.name] ?? "").trim()) {
        nextErrors[field.name] = `${field.label} is required`;
      }
    });

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (formMode === "add") {
      const nextRow = {
        id: String(Date.now()),
        ...formData,
      };
      setRows((currentRows) => [nextRow, ...currentRows]);
      setFeedback({
        severity: "success",
        message: `${entityLabel} added successfully.`,
      });
    } else {
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === editingRowId ? { ...row, ...formData } : row,
        ),
      );
      setFeedback({
        severity: "success",
        message: `${entityLabel} updated successfully.`,
      });
    }

    setFormOpen(false);
    setEditingRowId(null);
  };

  const handleChange = (name, value) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      setRows(normalizeImportedRows(parsedRows));
      setFeedback({
        severity: "success",
        message: `${parsedRows.length} ${entityLabel.toLowerCase()} record(s) imported from Excel.`,
      });
    } catch {
      setFeedback({
        severity: "error",
        message: "Unable to read the selected file.",
      });
    }

    event.target.value = "";
  };

  const handleReset = () => {
    setRows(initialRows);
    setFeedback({
      severity: "info",
      message: `Reset to sample ${entityLabel.toLowerCase()} data.`,
    });
  };

  return (
    <>
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
              {title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
              {description}
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleOpenAdd}
            >
              Add {entityLabel}
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadFileRoundedIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Import Excel
            </Button>
            <Button
              variant="text"
              startIcon={<RestartAltRoundedIcon />}
              onClick={handleReset}
            >
              Reset Sample
            </Button>
            <input
              hidden
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImport}
            />
          </Stack>
        </Stack>

        {feedback && (
          <Alert
            severity={feedback.severity}
            sx={{ mb: 2 }}
            onClose={() => setFeedback(null)}
          >
            {feedback.message}
          </Alert>
        )}

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ height: 560, width: "max-content", minWidth: "100%" }}>
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

      <Dialog open={formOpen} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogTitle>
          {formMode === "add" ? `Add ${entityLabel}` : `Edit ${entityLabel}`}
        </DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
              pt: 1,
            }}
          >
            {fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                value={formData[field.name] ?? ""}
                onChange={(event) => handleChange(field.name, event.target.value)}
                required={field.required}
                error={Boolean(formErrors[field.name])}
                helperText={formErrors[field.name] || field.helperText || ""}
                select={field.type === "select"}
                multiline={field.type === "multiline"}
                minRows={field.type === "multiline" ? 3 : undefined}
                type={field.type === "number" ? "number" : "text"}
                fullWidth
                sx={{
                  gridColumn:
                    field.fullWidth || field.type === "multiline"
                      ? "1 / -1"
                      : "auto",
                }}
                SelectProps={{
                  native: true,
                }}
              >
                {field.type === "select"
                  ? [
                      <option key="" value="">
                        Select {field.label}
                      </option>,
                      ...(field.options || []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      )),
                    ]
                  : undefined}
              </TextField>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={Boolean(viewRow)}
        onClose={() => setViewRow(null)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            p: 2.5,
          },
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
          {entityLabel} Details
        </Typography>
        <Stack spacing={1.5}>
          {fields.map((field) => (
            <Paper key={field.name} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {field.label}
              </Typography>
              <Typography sx={{ mt: 0.4, fontWeight: 600 }}>
                {viewRow?.[field.name] || "-"}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Drawer>
    </>
  );
}
