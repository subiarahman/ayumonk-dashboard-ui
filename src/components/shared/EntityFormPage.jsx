import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { buildEmptyForm, loadEntityRows, saveEntityRows } from "../../utils/entityStorage";
import { getSurfaceBackground } from "../../theme";

export default function EntityFormPage({
  mode,
  entityLabel,
  title,
  basePath,
  storageKey,
  fields,
  initialRows,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const records = useMemo(() => loadEntityRows(storageKey, initialRows), [initialRows, storageKey]);
  const record = mode === "edit" ? records.find((item) => item.id === id) : null;
  const [formData, setFormData] = useState(() => {
    if (record) {
      return fields.reduce((accumulator, field) => {
        accumulator[field.name] = record[field.name] ?? "";
        return accumulator;
      }, {});
    }

    return buildEmptyForm(fields);
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    fields.forEach((field) => {
      if (field.required && !String(formData[field.name] ?? "").trim()) {
        nextErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    let nextRows;
    if (mode === "edit" && record) {
      nextRows = records.map((item) => (item.id === id ? { ...item, ...formData } : item));
    } else {
      nextRows = [{ id: String(Date.now()), ...formData }, ...records];
    }

    saveEntityRows(storageKey, nextRows);
    navigate(basePath, {
      replace: true,
      state: {
        feedback: {
          severity: "success",
          message: `${entityLabel} ${mode === "edit" ? "updated" : "added"} successfully.`,
        },
      },
    });
  };

  if (mode === "edit" && !record) {
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
        <Alert severity="warning" sx={{ mb: 2 }}>
          This {entityLabel.toLowerCase()} record could not be found.
        </Alert>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(basePath)}>
          Back to {title}
        </Button>
      </Paper>
    );
  }

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
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 750 }}>
            {mode === "edit" ? `Edit ${entityLabel}` : `Add ${entityLabel}`}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            {mode === "edit"
              ? `Update the ${entityLabel.toLowerCase()} information below.`
              : `Create a new ${entityLabel.toLowerCase()} record using the same structure as your Excel file.`}
          </Typography>
        </Box>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(basePath)}>
          Back to list
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {fields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            value={formData[field.name] ?? ""}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                [field.name]: event.target.value,
              }))
            }
            required={field.required}
            error={Boolean(errors[field.name])}
            helperText={errors[field.name] || field.helperText || ""}
            select={field.type === "select"}
            multiline={field.type === "multiline"}
            minRows={field.type === "multiline" ? 4 : undefined}
            type={field.type === "number" ? "number" : "text"}
            fullWidth
            sx={{
              gridColumn:
                field.fullWidth || field.type === "multiline" ? "1 / -1" : "auto",
            }}
          >
            {field.type === "select"
              ? [
                  <MenuItem key="" value="">
                    Select {field.label}
                  </MenuItem>,
                  ...(field.options || []).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  )),
                ]
              : undefined}
          </TextField>
        ))}
      </Box>

      <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
        <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" onClick={() => navigate(basePath)}>
          Cancel
        </Button>
      </Stack>
    </Paper>
  );
}
