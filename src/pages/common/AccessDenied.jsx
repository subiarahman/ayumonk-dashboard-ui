import { Box, Button, Paper, Stack, Typography, useTheme } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { getSurfaceBackground } from "../../theme";

export default function AccessDenied() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: "100%",
          p: { xs: 3, sm: 4 },
          textAlign: "center",
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: getSurfaceBackground(theme, 0.9),
        }}
      >
        <Stack spacing={2} alignItems="center">
          <LockOutlinedIcon sx={{ fontSize: 56, color: "warning.main" }} />
          <Typography variant="h4" sx={{ fontWeight: 750 }}>
            Access Denied
          </Typography>
          <Typography color="text.secondary">
            You do not have permission to view this page. Please contact your
            administrator if you believe this is a mistake.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button variant="contained" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
