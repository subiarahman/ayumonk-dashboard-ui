import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Avatar,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Layout from "../../layouts/commonLayout/Layout";
import { updateProfile } from "../../store/authSlice";
import { getSurfaceBackground } from "../../theme";

export default function Profile() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth.user);
  const role = profile?.role || "admin";
  const [name, setName] = useState(profile?.name || "Portal User");
  const [email, setEmail] = useState(profile?.email || "user@example.com");
  const [message, setMessage] = useState("");

  const handleSave = () => {
    dispatch(
      updateProfile({
        name: name.trim(),
        email: email.trim(),
      }),
    );
    setMessage("Profile updated successfully.");
  };

  return (
    <Layout role={role} title="My Profile">
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 12 }}>
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
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems="center">
              <Avatar sx={{ width: 80, height: 80, fontSize: 30, bgcolor: "primary.main" }}>
                {name.charAt(0).toUpperCase()}
              </Avatar>
              <Stack spacing={0.6}>
                <Typography variant="h5">{name}</Typography>
                <Typography color="text.secondary">{email}</Typography>
                <Typography sx={{ textTransform: "capitalize" }} color="text.secondary">
                  Role: {role}
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <Stack spacing={2}>
              {!!message && <Alert severity="success">{message}</Alert>}
              <TextField
                label="Full Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                fullWidth
              />
              <TextField
                label="Email Address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                fullWidth
              />
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" onClick={handleSave}>
                  Save Changes
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* <Grid size={{ xs: 12, lg: 12 }}>
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
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Account Summary
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Current Role
              </Typography>
              <Typography sx={{ textTransform: "capitalize", fontWeight: 700 }}>
                {role}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Auth Token
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                {profile?.token || "No token"}
              </Typography>
            </Stack>
          </Paper>
        </Grid> */}
      </Grid>
    </Layout>
  );
}
