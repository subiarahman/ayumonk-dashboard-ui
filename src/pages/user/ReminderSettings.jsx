import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import { formatDateTimeISTShort } from "../../utils/dateTime";
import { getSurfaceBackground } from "../../theme";
import usePushNotifications from "../../hooks/usePushNotifications";
import {
  clearMutationError,
  clearSavedFlag,
  clearSnooze,
  fetchReminderSettings,
  flashSaved,
  snoozeReminders,
  toggleReminderField,
  updateReminderSettings,
} from "../../store/reminderSettingsSlice";

const isIOSDevice = () =>
  typeof navigator !== "undefined" &&
  /iphone|ipad|ipod/i.test(navigator.userAgent);

const isStandaloneMode = () => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if (window.navigator?.standalone === true) return true;
  return false;
};

const REMINDER_TYPES = [
  {
    key: "daily_challenge",
    icon: "📋",
    label: "Daily challenge reminder",
    sub: "Fires at your set time if any challenge is uncomplete",
  },
  {
    key: "streak_alert",
    icon: "🔥",
    label: "Streak at risk alert",
    sub: "Fires at 9PM if your streak ≥ 3 days and today isn't done",
  },
  {
    key: "program_ending",
    icon: "📅",
    label: "Program ending soon",
    sub: "Once, 3 days before a KPI window closes",
  },
  {
    key: "new_program",
    icon: "🌱",
    label: "New program starting tomorrow",
    sub: "Once, day before a new KPI window opens",
  },
  {
    key: "badge_milestone",
    icon: "🏅",
    label: "Badge milestone alert",
    sub: "When you're 1 day away from a 7/14/21/30-day badge",
  },
];

const CHANNELS = [
  { id: "email", field: "email_enabled", icon: "📧", label: "Email" },
  { id: "push", field: "push_enabled", icon: "🔔", label: "Browser Push" },
  {
    id: "whatsapp",
    field: "whatsapp_enabled",
    icon: "💬",
    label: "WhatsApp",
    disabled: true,
    note: "Phase 3 — coming soon",
  },
];

const SNOOZE_OPTIONS = [
  { id: "24h", label: "24h", note: "24 hours" },
  { id: "48h", label: "48h", note: "2 days" },
  { id: "7d", label: "7d", note: "1 week" },
];

const PUSH_PLATFORM_NOTES = [
  ["Android Chrome / Edge", "✅ Works from browser tab — no home screen install needed"],
  ["iOS Safari 16.4+", "⚠️ Requires Add to Home Screen first — then works identically to native"],
  ["Desktop Chrome / Firefox", "✅ Works as desktop notification in system tray"],
  ["iOS Safari < 16.4", "❌ Not supported — use Email channel instead"],
];

const REMINDER_HISTORY = [
  {
    type: "daily_incomplete",
    icon: "📋",
    label: "Daily Challenge Reminder",
    channel: "email",
    time: "Yesterday 8:00 PM",
    status: "sent",
  },
  {
    type: "streak_risk",
    icon: "🔥",
    label: "Streak At Risk Alert",
    channel: "push",
    time: "2 days ago 9:00 PM",
    status: "sent",
  },
  {
    type: "window_closing",
    icon: "📅",
    label: "Hydration Program Closing",
    channel: "email",
    time: "3 days ago 8:00 AM",
    status: "sent",
  },
  {
    type: "daily_incomplete",
    icon: "📋",
    label: "Daily Challenge Reminder",
    channel: "email",
    time: "4 days ago 8:00 PM",
    status: "suppressed",
  },
  {
    type: "milestone_near",
    icon: "🏅",
    label: "Badge Milestone — 7-Day",
    channel: "push",
    time: "5 days ago 8:00 AM",
    status: "sent",
  },
  {
    type: "window_opening",
    icon: "🌱",
    label: "Sleep Program Starting Soon",
    channel: "email",
    time: "6 days ago 8:00 AM",
    status: "failed",
  },
];

const STATUS_COLORS = {
  sent: "#16a34a",
  failed: "#dc2626",
  suppressed: "#6b7280",
};

const PUSH_STATUS_COLORS = (status) => {
  if (status.startsWith("✅")) return "#16a34a";
  if (status.startsWith("⚠️")) return "#d97706";
  return "#dc2626";
};

const TIME_DEBOUNCE_MS = 500;

const toApiTime = (value) => {
  if (!value) return "";
  const parts = value.split(":");
  const hh = (parts[0] || "00").padStart(2, "0");
  const mm = (parts[1] || "00").padStart(2, "0");
  const ss = (parts[2] || "00").padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const toInputTime = (value) => {
  if (!value) return "20:00";
  const [hh = "20", mm = "00"] = value.split(":");
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`;
};

export default function ReminderSettings() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const accent = theme.palette.primary.main;
  const surface = getSurfaceBackground(theme);

  const { data, loading, error, mutationError, saved } = useSelector(
    (state) => state.reminderSettings,
  );

  const {
    supported: pushSupported,
    subscribed: pushSubscribed,
    permission: pushPermission,
    busy: pushBusy,
    error: pushError,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush,
  } = usePushNotifications();

  const [expanded, setExpanded] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pushDeniedNote, setPushDeniedNote] = useState("");
  const [timeDraft, setTimeDraft] = useState("");
  const [tzDraft, setTzDraft] = useState("");
  const timeDebounceRef = useRef(null);
  const tzAutoSetRef = useRef(false);
  const lastPushErrorRef = useRef(null);

  useEffect(() => {
    if (pushError && pushError !== lastPushErrorRef.current) {
      lastPushErrorRef.current = pushError;
      setPushDeniedNote(
        pushError.message ||
          "Could not enable browser push. Please try again.",
      );
    }
  }, [pushError]);

  useEffect(() => {
    dispatch(fetchReminderSettings());
  }, [dispatch]);

  useEffect(() => {
    if (data?.reminder_time) {
      setTimeDraft(toInputTime(data.reminder_time));
    }
  }, [data?.reminder_time]);

  useEffect(() => {
    if (data?.timezone) {
      setTzDraft(data.timezone);
    }
  }, [data?.timezone]);

  useEffect(() => {
    if (!data || tzAutoSetRef.current) return;
    if (data.timezone && data.timezone !== "UTC") {
      tzAutoSetRef.current = true;
      return;
    }
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected && detected !== data.timezone) {
      tzAutoSetRef.current = true;
      dispatch(updateReminderSettings({ timezone: detected }));
    } else {
      tzAutoSetRef.current = true;
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (!saved) return undefined;
    const timer = window.setTimeout(() => dispatch(clearSavedFlag()), 2500);
    return () => window.clearTimeout(timer);
  }, [saved, dispatch]);

  useEffect(
    () => () => {
      if (timeDebounceRef.current) {
        window.clearTimeout(timeDebounceRef.current);
      }
    },
    [],
  );

  const isSnoozing = useMemo(() => {
    if (!data?.snooze_until) return false;
    return new Date(data.snooze_until) > new Date();
  }, [data?.snooze_until]);

  const snoozeEnds = isSnoozing
    ? formatDateTimeISTShort(data.snooze_until)
    : null;

  const activeChannels = useMemo(() => {
    if (!data) return [];
    return [
      data.email_enabled ? "email" : null,
      data.push_enabled ? "push" : null,
      data.whatsapp_enabled ? "whatsapp" : null,
    ].filter(Boolean);
  }, [data]);

  const statusLine = useMemo(() => {
    if (!data) return loading ? "Loading…" : "Reminders are off";
    if (isSnoozing) return `Snoozed until ${snoozeEnds}`;
    if (!data.is_enabled) return "Reminders are off";
    const channels = activeChannels.join(", ") || "no channels";
    const time = (data.reminder_time || "").slice(0, 5);
    return `Active · ${channels} · ${time} ${data.timezone}`;
  }, [activeChannels, data, isSnoozing, loading, snoozeEnds]);

  const handleToggleField = (field, nextValue) => {
    dispatch(toggleReminderField({ field, value: nextValue }));
  };

  const handleChannelClick = async (channel) => {
    if (channel.disabled || !data) return;
    const current = Boolean(data[channel.field]);
    const next = !current;

    if (channel.id === "push") {
      setPushDeniedNote("");
      lastPushErrorRef.current = null;

      if (!pushSupported) {
        setPushDeniedNote(
          isIOSDevice() && !isStandaloneMode()
            ? "Open Ayumonk in Safari and use Add to Home Screen to enable Browser Push."
            : "Browser Push is not supported on this device. Use Email instead.",
        );
        return;
      }

      if (next) {
        const sub = await subscribeToPush();
        if (!sub) {
          if (!pushDeniedNote) {
            setPushDeniedNote(
              pushPermission === "denied"
                ? "Browser denied notification permission. Enable it in your browser settings to receive reminders."
                : "Browser Push could not be enabled. Please try again.",
            );
          }
          return;
        }
      } else {
        await unsubscribeFromPush();
      }

      handleToggleField(channel.field, next);
      return;
    }

    handleToggleField(channel.field, next);
  };

  const handleTimeChange = (event) => {
    const next = event.target.value;
    setTimeDraft(next);
    dispatch(clearMutationError());
    if (timeDebounceRef.current) {
      window.clearTimeout(timeDebounceRef.current);
    }
    timeDebounceRef.current = window.setTimeout(() => {
      const apiTime = toApiTime(next);
      if (apiTime && apiTime !== data?.reminder_time) {
        dispatch(updateReminderSettings({ reminder_time: apiTime }));
      }
    }, TIME_DEBOUNCE_MS);
  };

  const handleSavePreferences = () => {
    if (!data) return;
    if (timeDebounceRef.current) {
      window.clearTimeout(timeDebounceRef.current);
      timeDebounceRef.current = null;
    }
    const dirty = {};
    const desiredTime = toApiTime(timeDraft);
    if (desiredTime && desiredTime !== data.reminder_time) {
      dirty.reminder_time = desiredTime;
    }
    if (Object.keys(dirty).length === 0) {
      dispatch(flashSaved());
      return;
    }
    dispatch(updateReminderSettings(dirty));
  };

  const handleSnooze = (duration) => {
    dispatch(snoozeReminders(duration));
  };

  const handleClearSnooze = () => {
    dispatch(clearSnooze());
  };

  if (loading && !data) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: surface,
        }}
      >
        <Typography color="text.secondary">
          Loading reminder settings…
        </Typography>
      </Paper>
    );
  }

  if (error && !data) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => dispatch(fetchReminderSettings())}
          >
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!data) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: data.is_enabled ? alpha(accent, 0.32) : "divider",
        bgcolor: surface,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mb: expanded ? 2 : 0 }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(accent, 0.12),
            color: accent,
          }}
        >
          <NotificationsActiveRoundedIcon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700 }}>Reminder Settings</Typography>
          <Typography variant="caption" color="text.secondary">
            {statusLine}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: data.is_enabled ? "#15803d" : "text.secondary",
            }}
          >
            {data.is_enabled ? "ON" : "OFF"}
          </Typography>
          <Switch
            checked={Boolean(data.is_enabled)}
            onChange={(event) =>
              handleToggleField("is_enabled", event.target.checked)
            }
          />
        </Stack>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setExpanded((current) => !current)}
          startIcon={
            expanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />
          }
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {expanded ? "Collapse" : "Configure"}
        </Button>
      </Stack>

      <Collapse in={expanded} unmountOnExit>
        <Box
          sx={{
            opacity: data.is_enabled ? 1 : 0.45,
            pointerEvents: data.is_enabled ? "auto" : "none",
            transition: "opacity 0.2s",
          }}
        >
          <Divider sx={{ mb: 2 }} />

          {mutationError && (
            <Alert
              severity="error"
              onClose={() => dispatch(clearMutationError())}
              sx={{ mb: 2 }}
            >
              {mutationError}
            </Alert>
          )}

          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 1 }}
          >
            Delivery Channel
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 1, mb: 1.5 }}
            useFlexGap
            flexWrap="wrap"
          >
            {CHANNELS.map((channel) => {
              const enabled = Boolean(data[channel.field]);
              const isPush = channel.id === "push";
              const pushUnsupported = isPush && !pushSupported;
              const pushDesync = isPush && enabled && !pushSubscribed && !pushBusy;
              const cardDisabled = channel.disabled || (isPush && pushBusy);

              let note = channel.note;
              if (!note) {
                if (isPush) {
                  if (pushUnsupported) {
                    note = isIOSDevice() && !isStandaloneMode()
                      ? "Add to Home Screen first"
                      : "Not supported in this browser";
                  } else if (pushBusy) {
                    note = enabled ? "Disabling…" : "Requesting permission…";
                  } else if (pushDesync) {
                    note = "Permission lost — tap to re-enable";
                  } else if (enabled && pushSubscribed) {
                    note = "Enabled";
                  } else {
                    note = "Tap to request permission";
                  }
                } else {
                  note = enabled ? "Enabled" : "Tap to enable";
                }
              }

              return (
                <Paper
                  key={channel.id}
                  variant="outlined"
                  onClick={() => !cardDisabled && handleChannelClick(channel)}
                  sx={{
                    cursor: cardDisabled
                      ? "not-allowed"
                      : channel.disabled
                        ? "not-allowed"
                        : "pointer",
                    px: 2,
                    py: 1.25,
                    minWidth: 116,
                    borderRadius: 2.5,
                    borderColor: pushDesync
                      ? "#d97706"
                      : enabled
                        ? accent
                        : "divider",
                    bgcolor: pushDesync
                      ? alpha("#d97706", 0.06)
                      : enabled
                        ? alpha(accent, 0.08)
                        : "transparent",
                    opacity: channel.disabled || pushUnsupported ? 0.55 : 1,
                    textAlign: "center",
                    transition: "all 0.15s",
                  }}
                >
                  <Typography sx={{ fontSize: 20 }}>{channel.icon}</Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: pushDesync
                        ? "#d97706"
                        : enabled
                          ? accent
                          : "text.primary",
                    }}
                  >
                    {channel.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {note}
                  </Typography>
                  {isPush && pushBusy && (
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "#d97706" }}
                    >
                      Working…
                    </Typography>
                  )}
                  {isPush && enabled && pushSubscribed && !pushBusy && (
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "#15803d" }}
                    >
                      ✓ Enabled
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Stack>

          {pushDeniedNote && (
            <Alert
              severity="warning"
              onClose={() => setPushDeniedNote("")}
              sx={{ mb: 1.5 }}
            >
              {pushDeniedNote}
            </Alert>
          )}

          {data.push_enabled && (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mb: 1.5,
                borderRadius: 2.5,
                borderColor: alpha(accent, 0.3),
                bgcolor: alpha(accent, 0.04),
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: accent,
                  display: "block",
                  mb: 1,
                }}
              >
                📲 How Browser Push Works
              </Typography>
              <Stack spacing={0.5}>
                {PUSH_PLATFORM_NOTES.map(([platform, status]) => (
                  <Stack
                    key={platform}
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ minWidth: 180 }}
                    >
                      {platform}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: PUSH_STATUS_COLORS(status) }}
                    >
                      {status}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          )}

          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              mb: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <TextField
              label="Reminder Time"
              type="time"
              value={timeDraft}
              onChange={handleTimeChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              helperText="Saved automatically when you change it"
            />
            <TextField
              label="Timezone"
              value={tzDraft}
              onChange={(event) => setTzDraft(event.target.value)}
              onBlur={() => {
                const trimmed = tzDraft.trim();
                if (trimmed && trimmed !== data.timezone) {
                  dispatch(updateReminderSettings({ timezone: trimmed }));
                }
              }}
              fullWidth
              size="small"
              helperText="Auto-detected on first save · saves on blur"
            />
          </Box>

          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 1 }}
          >
            Which Reminders to Receive
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 1, mb: 2 }}>
            {REMINDER_TYPES.map((type) => {
              const active = Boolean(data[type.key]);
              return (
                <Paper
                  key={type.key}
                  variant="outlined"
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2.5,
                    borderColor: active ? alpha(accent, 0.3) : "divider",
                    bgcolor: active ? alpha(accent, 0.04) : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: 20 }}>{type.icon}</Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: active ? "text.primary" : "text.secondary",
                      }}
                    >
                      {type.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.sub}
                    </Typography>
                  </Box>
                  <Switch
                    checked={active}
                    size="small"
                    onChange={(event) =>
                      handleToggleField(type.key, event.target.checked)
                    }
                  />
                </Paper>
              );
            })}
          </Stack>

          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2.5 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              spacing={1}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <PauseCircleOutlineRoundedIcon
                  fontSize="small"
                  sx={{ color: "text.secondary" }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                    Snooze All Reminders
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isSnoozing
                      ? `Snoozed until ${snoozeEnds}`
                      : "Temporarily pause all notifications"}
                  </Typography>
                </Box>
              </Stack>
              {isSnoozing ? (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={handleClearSnooze}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Cancel Snooze
                </Button>
              ) : (
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {SNOOZE_OPTIONS.map((option) => (
                    <Tooltip key={option.id} title={option.note}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSnooze(option.id)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          minWidth: 64,
                        }}
                      >
                        {option.label}
                      </Button>
                    </Tooltip>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ sm: "center" }}
            sx={{ mb: 2 }}
          >
            <Button
              variant="contained"
              onClick={handleSavePreferences}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                px: 4,
                bgcolor: saved ? "#16a34a" : undefined,
                "&:hover": { bgcolor: saved ? "#15803d" : undefined },
              }}
            >
              {saved ? "✓ Saved!" : "Save Preferences"}
            </Button>
            <Typography variant="caption" color="text.secondary">
              Toggles save instantly · this button flushes any pending time
              change
            </Typography>
          </Stack>

          <Box>
            <Button
              variant="text"
              size="small"
              onClick={() => setHistoryOpen((current) => !current)}
              endIcon={
                historyOpen ? (
                  <ExpandLessRoundedIcon />
                ) : (
                  <ExpandMoreRoundedIcon />
                )
              }
              sx={{ textTransform: "none", fontWeight: 700, px: 0 }}
            >
              {historyOpen
                ? "Hide reminder history"
                : "Show last 7 reminders"}
            </Button>
            <Collapse in={historyOpen} unmountOnExit>
              <Stack spacing={0.75} sx={{ mt: 1 }}>
                {REMINDER_HISTORY.map((entry, index) => (
                  <Paper
                    key={`${entry.type}-${index}`}
                    variant="outlined"
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      display: "grid",
                      gridTemplateColumns: "28px 1fr auto auto",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 18, textAlign: "center" }}>
                      {entry.icon}
                    </Typography>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }} noWrap>
                        {entry.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.time}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={entry.channel}
                      variant="outlined"
                      sx={{ textTransform: "lowercase", fontWeight: 600 }}
                    />
                    <Chip
                      size="small"
                      label={entry.status}
                      sx={{
                        fontWeight: 700,
                        textTransform: "lowercase",
                        bgcolor: alpha(
                          STATUS_COLORS[entry.status] || "#6b7280",
                          0.1,
                        ),
                        color: STATUS_COLORS[entry.status] || "#6b7280",
                      }}
                    />
                  </Paper>
                ))}
              </Stack>
            </Collapse>
          </Box>

          {!data.is_enabled && (
            <Alert severity="info" sx={{ mt: 2 }} icon={false}>
              Toggle the master switch above to enable reminders.
            </Alert>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
