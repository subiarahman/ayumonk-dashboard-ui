import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import NotificationsOffRoundedIcon from "@mui/icons-material/NotificationsOffRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import usePushNotifications from "../hooks/usePushNotifications";

const isIOSDevice = () =>
  typeof navigator !== "undefined" &&
  /iphone|ipad|ipod/i.test(navigator.userAgent);

const isStandaloneMode = () => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if (window.navigator?.standalone === true) return true;
  return false;
};

export default function NotificationToggle({ sx }) {
  const theme = useTheme();
  const accent = theme.palette.primary.main;
  const {
    supported,
    permission,
    subscribed,
    busy,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [toast, setToast] = useState(null);
  const [lastErrorShown, setLastErrorShown] = useState(null);

  if (error && error !== lastErrorShown) {
    setLastErrorShown(error);
    setToast({
      severity: "error",
      message:
        error.message || "Could not enable notifications. Please try again.",
    });
  }

  if (!supported) return null;

  const ios = isIOSDevice();
  const standalone = isStandaloneMode();

  // iOS web push only works after the user installs the PWA via Safari's
  // Share → Add to Home Screen and opens it from the home-screen icon.
  if (ios && !standalone) {
    return (
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="flex-start"
        sx={{
          p: 1.25,
          borderRadius: 2,
          border: "1px solid",
          borderColor: alpha(accent, 0.25),
          bgcolor: alpha(accent, 0.06),
          ...sx,
        }}
      >
        <IosShareRoundedIcon sx={{ color: accent, mt: 0.25 }} fontSize="small" />
        <Typography variant="caption" color="text.secondary">
          Open Ayumonk in Safari and use{" "}
          <Box component="span" sx={{ fontWeight: 700, color: accent }}>
            Add to Home Screen
          </Box>{" "}
          to enable notifications.
        </Typography>
      </Stack>
    );
  }

  const denied = permission === "denied";

  const handleClick = async () => {
    if (subscribed) {
      await unsubscribe();
      setToast({ severity: "info", message: "Notifications turned off." });
      return;
    }
    const sub = await subscribe();
    if (sub) {
      setToast({ severity: "success", message: "Notifications enabled!" });
    }
  };

  const renderIcon = () => {
    if (busy) return <CircularProgress size={16} thickness={5} sx={{ color: "inherit" }} />;
    if (subscribed) return <NotificationsActiveRoundedIcon fontSize="small" />;
    if (denied) return <NotificationsOffRoundedIcon fontSize="small" />;
    return <NotificationsRoundedIcon fontSize="small" />;
  };

  const buttonLabel = busy
    ? subscribed
      ? "Turning off…"
      : "Enabling…"
    : subscribed
      ? "Notifications on"
      : "Turn on notifications";

  return (
    <Box sx={sx}>
      <Button
        variant={subscribed ? "contained" : "outlined"}
        size="small"
        onClick={handleClick}
        disabled={busy || (denied && !subscribed)}
        startIcon={renderIcon()}
        sx={{
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 999,
          px: 1.75,
          color: subscribed ? "#fff" : accent,
          borderColor: alpha(accent, 0.45),
          bgcolor: subscribed ? accent : alpha(accent, 0.06),
          "&:hover": {
            borderColor: accent,
            bgcolor: subscribed ? accent : alpha(accent, 0.12),
          },
        }}
      >
        {buttonLabel}
      </Button>

      {denied && !subscribed && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.75 }}
        >
          Notifications are blocked. Enable them in your browser settings to
          receive Ayumonk reminders.
        </Typography>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        {toast ? (
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => setToast(null)}
            sx={{ fontWeight: 600 }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
