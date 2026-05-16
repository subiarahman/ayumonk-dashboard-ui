import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import {
  Button,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SystemUpdateAltRoundedIcon from "@mui/icons-material/SystemUpdateAltRounded";

// Re-check for a new service worker every hour while the app is open.
const UPDATE_INTERVAL_MS = 60 * 60 * 1000;

export default function PWAUpdatePrompt() {
  const theme = useTheme();
  const accent = theme.palette.primary.main;
  const [offlineToastOpen, setOfflineToastOpen] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (!registration) return;
      setInterval(() => {
        registration.update().catch(() => {});
      }, UPDATE_INTERVAL_MS);
    },
    onOfflineReady() {
      setOfflineToastOpen(true);
    },
  });

  useEffect(() => {
    if (offlineReady) setOfflineToastOpen(true);
  }, [offlineReady]);

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismissUpdate = () => {
    setNeedRefresh(false);
  };

  const handleCloseOffline = () => {
    setOfflineToastOpen(false);
    setOfflineReady(false);
  };

  return (
    <>
      {needRefresh && (
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            zIndex: (t) => t.zIndex.snackbar + 1,
            left: { xs: 12, sm: "auto" },
            right: { xs: 12, sm: 24 },
            bottom: { xs: 12, sm: 24 },
            px: 2,
            py: 1.5,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: alpha(accent, 0.4),
            bgcolor: theme.palette.background.paper,
            maxWidth: 380,
          }}
          role="status"
          aria-live="polite"
        >
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <SystemUpdateAltRoundedIcon sx={{ color: accent, mt: 0.25 }} />
            <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                A new version of Ayumonk is ready
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Reload to get the latest features and fixes.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleUpdate}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Reload
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleDismissUpdate}
                  sx={{ textTransform: "none", color: "text.secondary" }}
                >
                  Later
                </Button>
              </Stack>
            </Stack>
            <IconButton size="small" onClick={handleDismissUpdate}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Paper>
      )}

      <Snackbar
        open={offlineToastOpen}
        autoHideDuration={4000}
        onClose={handleCloseOffline}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        message="Ayumonk is ready to work offline"
      />
    </>
  );
}
