import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { clearAuthError, loginUser, setAuthError } from "../../store/authSlice";
import { getSurfaceBackground } from "../../theme";

export default function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password");
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (event) => {
    event.preventDefault();
    dispatch(clearAuthError());

    if (!username.trim() || !password.trim()) {
      dispatch(setAuthError("Please enter both username and password."));
      return;
    }

    try {
      const result = await dispatch(
        loginUser({
          username: username.trim(),
          password,
        }),
      ).unwrap();

      const redirectTarget = location.state?.from?.pathname
        ? `${location.state.from.pathname}${location.state.from.search || ""}${location.state.from.hash || ""}`
        : null;
      const target =
        redirectTarget ||
        (result.role === "superadmin"
          ? "/super-admin/dashboard"
          : result.role === "admin"
            ? "/admin/dashboard"
            : "/user/dashboard");
      navigate(target, { replace: true });
    } catch {
      // Error state is already handled by auth slice.
    }
  };

  const handleUsernameChange = (event) => {
    if (error) {
      dispatch(clearAuthError());
    }
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    if (error) {
      dispatch(clearAuthError());
    }
    setPassword(event.target.value);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: getSurfaceBackground(theme, 0.9),
        }}
      >
        <Typography variant="h4" sx={{ mb: 1 }}>
          Google Dashboard Login
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Sign in to continue to your workspace.
        </Typography>

        <Stack component="form" spacing={2} onSubmit={handleLogin}>
          {!!error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={handleUsernameChange}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : "Login"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
