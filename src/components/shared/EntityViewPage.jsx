import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Paper, Stack, Typography, useTheme } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { loadEntityRows } from "../../utils/entityStorage";
import { getSurfaceBackground } from "../../theme";

export default function EntityViewPage({
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
  const record = records.find((item) => item.id === id);

  if (!record) {
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 750 }}>
            {entityLabel} Details
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Review the full {entityLabel.toLowerCase()} record before making changes.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(basePath)}>
            Back to list
          </Button>
          <Button
            variant="contained"
            startIcon={<EditRoundedIcon />}
            onClick={() => navigate(`${basePath}/${id}/edit`)}
          >
            Edit
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {fields.map((field) => (
          <Paper
            key={field.name}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2.5,
              gridColumn:
                field.fullWidth || field.type === "multiline" ? "1 / -1" : "auto",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {field.label}
            </Typography>
            <Typography sx={{ mt: 0.8, fontWeight: 600, whiteSpace: "pre-wrap" }}>
              {record[field.name] || "-"}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
}
