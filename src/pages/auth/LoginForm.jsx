import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { clearAuthError, loginUser, setAuthError } from "../../store/authSlice";
import { loadAuthorization } from "../../store/permissionSlice";
import {
  getHomePath,
  isOtherRoleHomePath,
  isPathAllowedForRole,
} from "../../utils/roleHelper";
import { getSurfaceBackground } from "../../theme";
import AyuLogo from "../../components/AyuLogo";

// Shared sign-in form + logic. Rendered two ways:
//   • full-page at /login (Login.jsx wraps this in a centered viewport Box)
//   • inside a Dialog on the marketing landing page (LoginModal.jsx)
// `inModal` drops the standalone Paper chrome so the Dialog provides the
// surface. `onSuccess` (optional) fires right before the post-login navigation
// so a host modal can close itself.
export default function LoginForm({ inModal = false, onSuccess }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      await dispatch(loadAuthorization({ force: true }));

      const homeTarget = getHomePath({
        isPlatformAdmin: result.isPlatformAdmin,
        role: result.role,
        rawRole: result.rawRole,
      });
      const fromPath = location.state?.from?.pathname;
      // Honor a deep-link `from` only if it's accessible to the new user AND
      // it's not another role's home page (a stale `from` left over from the
      // previous account's session). Both Company Admin and HR Manager are
      // role="admin" but live on different homes, so isPathAllowedForRole
      // alone can't catch the bleed-over.
      const honorFrom =
        fromPath &&
        isPathAllowedForRole(fromPath, {
          role: result.role,
          isPlatformAdmin: result.isPlatformAdmin,
        }) &&
        !isOtherRoleHomePath(fromPath, {
          isPlatformAdmin: result.isPlatformAdmin,
          role: result.role,
          rawRole: result.rawRole,
        });
      const target = honorFrom
        ? `${fromPath}${location.state.from.search || ""}${location.state.from.hash || ""}`
        : homeTarget;
      if (onSuccess) onSuccess();
      navigate(target, { replace: true, state: null });
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

  // In a Dialog the surface (rounded card, padding) comes from the Dialog's
  // Paper, so render into a plain Box. Standalone, render our own Paper card.
  const Container = inModal ? Box : Paper;
  const containerProps = inModal
    ? { sx: { p: { xs: 2.5, sm: 3.5 } } }
    : {
        elevation: 0,
        sx: {
          width: "100%",
          maxWidth: 460,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: getSurfaceBackground(theme, 0.9),
        },
      };

  return (
    <Container {...containerProps}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <AyuLogo size={40} />
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              color: "#6db33f",
              fontSize: 22,
              lineHeight: 1.1,
              letterSpacing: 1,
            }}
          >
            AYUMONK
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              color: "text.secondary",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Wellness Intelligence Platform
          </Typography>
        </Box>
      </Stack>

      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Sign in
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
          autoFocus
          autoComplete="username"
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={handlePasswordChange}
          autoComplete="current-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                  edge="end"
                >
                  {showPassword ? (
                    <VisibilityOffRoundedIcon />
                  ) : (
                    <VisibilityRoundedIcon />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? <CircularProgress size={22} color="inherit" /> : "Login"}
        </Button>
      </Stack>
    </Container>
  );
}
