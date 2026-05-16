import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InstallMobileRoundedIcon from "@mui/icons-material/InstallMobileRounded";

const DISMISS_KEY = "pwa_install_dismissed";

const isIOSDevice = () =>
  typeof navigator !== "undefined" &&
  /iphone|ipad|ipod/i.test(navigator.userAgent);

const isStandaloneMode = () => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if (window.navigator?.standalone === true) return true;
  return false;
};

// Session-only dismissal: clicking "Later" hides the banner for the rest of
// the current browser session, but it returns next session so the user can
// still install. This mirrors the in-memory dismissal used in the client
// reference. Use sessionStorage (not localStorage) so a closed tab resets it.
const wasDismissedThisSession = () => {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

const persistDismissal = () => {
  try {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // sessionStorage unavailable (private mode quota etc.) — fall back to
    // in-memory state only. The banner will still hide for this render
    // cycle via setDismissed(true).
  }
};

export default function PWAInstallBanner() {
  const theme = useTheme();
  const accent = theme.palette.primary.main;
  const [ios] = useState(isIOSDevice);
  const [standalone] = useState(isStandaloneMode);
  const [dismissed, setDismissed] = useState(wasDismissedThisSession);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [iosStep, setIosStep] = useState(1);

  useEffect(() => {
    // Clean up the previous persistent localStorage flag (if any) — that
    // version dismissed forever, which is too aggressive.
    try {
      window.localStorage.removeItem("pwa_install_dismissed_at");
    } catch {
      // ignore
    }

    const onPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone || dismissed) return null;

  const handleDismiss = () => {
    persistDismissal();
    setDismissed(true);
  };

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        setInstalled(true);
      }
    } catch {
      // Browser declined — leave banner up so user can retry.
    } finally {
      setDeferredPrompt(null);
    }
  };

  if (installed) {
    return (
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          px: 2,
          py: 1.25,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: alpha("#16a34a", 0.4),
          bgcolor: alpha("#16a34a", 0.1),
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Typography sx={{ fontSize: 22 }}>✅</Typography>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, color: "#15803d", fontSize: 13 }}>
              AyuMonk installed!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Open from your home screen for the best experience and
              notifications.
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleDismiss}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Paper>
    );
  }

  if (ios) {
    const steps = [
      {
        n: "1",
        label: "Tap the Share button",
        icon: "□↑",
        color: "#2563eb",
      },
      {
        n: "2",
        label: "Scroll and tap 'Add to Home Screen'",
        icon: "⊞+",
        color: "#16a34a",
      },
      {
        n: "3",
        label: "Tap 'Add' in the top right",
        icon: "✓",
        color: "#d97706",
      },
    ];
    return (
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          px: 2,
          py: 1.5,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: alpha(accent, 0.35),
          bgcolor: alpha(accent, 0.06),
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 1.5 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: 22 }}>📲</Typography>
            <Box>
              <Typography
                sx={{ fontWeight: 700, color: accent, fontSize: 13 }}
              >
                Install AyuMonk on your iPhone
              </Typography>
              <Typography variant="caption" color="text.secondary">
                3 steps · Takes 15 seconds · Enables push notifications
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={handleDismiss}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Stack direction="row" spacing={1}>
          {steps.map((step) => {
            const active = iosStep >= Number(step.n);
            return (
              <Box
                key={step.n}
                onClick={() => setIosStep(Math.max(iosStep, Number(step.n) + 1))}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: alpha(step.color, 0.35),
                  bgcolor: alpha(step.color, 0.1),
                  px: 1,
                  py: 1,
                  textAlign: "center",
                  opacity: active ? 1 : 0.5,
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
              >
                <Typography sx={{ fontSize: 22, mb: 0.5 }}>
                  {step.icon}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: step.color,
                    display: "block",
                    fontSize: 10,
                  }}
                >
                  Step {step.n}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", fontSize: 10, lineHeight: 1.4 }}
                >
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        px: 2,
        py: 1.25,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: alpha(accent, 0.35),
        bgcolor: alpha(accent, 0.06),
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ sm: "center" }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(accent, 0.12),
            color: accent,
            flexShrink: 0,
          }}
        >
          <InstallMobileRoundedIcon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, color: accent, fontSize: 13 }}>
            Install AyuMonk on your device
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Add to home screen for daily reminders, offline access, and an
            app-like experience. No App Store required.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleAndroidInstall}
            disabled={!deferredPrompt}
            sx={{ textTransform: "none", fontWeight: 700, px: 2 }}
          >
            Install Now
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleDismiss}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
              borderColor: "divider",
            }}
          >
            Later
          </Button>
        </Stack>
      </Stack>
      {!deferredPrompt && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.75 }}
        >
          Tip: open your browser menu and choose &quot;Install app&quot; or
          &quot;Add to Home Screen&quot; if the install prompt isn&apos;t
          available yet.
        </Typography>
      )}
    </Paper>
  );
}
