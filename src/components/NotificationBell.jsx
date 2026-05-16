import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { getSurfaceBackground } from "../theme";
import {
  clearAllNotifications,
  clearMutationError,
  dismissNotification,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  recordNotificationAction,
  snoozeNotification,
} from "../store/notificationsSlice";

const POLL_INTERVAL_MS = 30_000;

const ICON_MAP = {
  flame: "🔥",
  medal: "🏅",
  clipboard: "📋",
  calendar: "📅",
  sprout: "🌱",
  trophy: "🏆",
  bell: "🔔",
};

const TYPE_COLORS = {
  streak_alert: "#d97706",
  badge_unlock: "#16a34a",
  challenge_pending: "#2563eb",
  daily_challenge: "#2563eb",
  program_ending: "#7c3aed",
  new_program: "#16a34a",
  generic: "#6b7280",
};

const ACTION_LABELS = {
  mark_done: "✓ Mark Done",
  commit_now: "✓ Commit Now",
  view_badge: "👁 View Badge",
  open_app: "Open App",
  view_schedule: "📅 View Schedule",
  preview: "🌿 Preview",
};

const ACTION_COLORS = {
  mark_done: "#16a34a",
  commit_now: "#16a34a",
  view_badge: "#2563eb",
  open_app: "#2563eb",
  view_schedule: "#7c3aed",
  preview: "#16a34a",
};

const resolveIcon = (key) => ICON_MAP[String(key || "").toLowerCase()] || "🔔";

const navigateForAction = (actionType, payload, navigate) => {
  const safePayload = payload || {};
  switch (actionType) {
    case "view_badge":
      if (safePayload.badge_id) {
        navigate(`/badges/${safePayload.badge_id}`);
        return;
      }
      navigate("/user/dashboard");
      return;
    case "open_app":
      navigate("/user/dashboard");
      return;
    case "view_schedule":
      if (safePayload.program_id) {
        navigate(`/programs/${safePayload.program_id}/schedule`);
        return;
      }
      navigate("/user/dashboard");
      return;
    case "preview":
      if (safePayload.program_id) {
        navigate(`/programs/${safePayload.program_id}/preview`);
        return;
      }
      navigate("/user/dashboard");
      return;
    case "mark_done":
    case "commit_now":
    default:
      // No navigation — recording the action is enough.
      break;
  }
};

const RTF = typeof Intl !== "undefined" && Intl.RelativeTimeFormat
  ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
  : null;

const formatRelativeTime = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = date.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60_000);
  const absMin = Math.abs(diffMin);

  if (absMin < 1) return "just now";
  if (!RTF) return date.toLocaleString();

  if (absMin < 60) return RTF.format(diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return RTF.format(diffHr, "hour");
  const diffDay = Math.round(diffHr / 24);
  if (Math.abs(diffDay) < 30) return RTF.format(diffDay, "day");
  const diffMonth = Math.round(diffDay / 30);
  if (Math.abs(diffMonth) < 12) return RTF.format(diffMonth, "month");
  return RTF.format(Math.round(diffMonth / 12), "year");
};

const formatBadge = (count) => (count > 99 ? "99+" : String(count));

export default function NotificationBell() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, unread, loading, mutationError } = useSelector(
    (state) => state.notifications,
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    if (!open) return undefined;
    dispatch(fetchNotifications({ limit: 20 }));
    const interval = window.setInterval(() => {
      dispatch(fetchNotifications({ limit: 20 }));
      dispatch(fetchUnreadCount());
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [open, dispatch]);

  useEffect(() => {
    if (!open) return undefined;
    const onFocus = () => {
      dispatch(fetchNotifications({ limit: 20 }));
      dispatch(fetchUnreadCount());
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [open, dispatch]);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleMarkAllRead = () => dispatch(markAllNotificationsRead());

  const handleClearAll = () => dispatch(clearAllNotifications());

  const handleCardClick = useCallback(
    (notification) => {
      if (!notification.is_read) {
        dispatch(markNotificationRead(notification.id));
      }
    },
    [dispatch],
  );

  const handlePrimaryAction = useCallback(
    (notification) => {
      const actionType = notification.action_type;
      if (!actionType) return;
      dispatch(
        recordNotificationAction({
          id: notification.id,
          action: actionType,
          payload: notification.action_payload || undefined,
        }),
      );
      const navigatesAway =
        actionType === "view_badge" ||
        actionType === "open_app" ||
        actionType === "view_schedule" ||
        actionType === "preview";
      if (navigatesAway) {
        handleClose();
        navigateForAction(actionType, notification.action_payload, navigate);
      }
    },
    [dispatch, navigate],
  );

  const handleSnooze = (notification) => {
    dispatch(snoozeNotification({ id: notification.id, duration: "1h" }));
  };

  const handleDismiss = (notification) => {
    dispatch(dismissNotification(notification.id));
  };

  const pushPreview = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
      items.find(
        (item) =>
          item.type === "streak_alert" || item.type === "daily_challenge",
      ) || items[0]
    );
  }, [items]);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          sx={{
            border: "1px solid",
            borderColor: open
              ? alpha(theme.palette.primary.main, 0.4)
              : "transparent",
            bgcolor: open
              ? alpha(theme.palette.primary.main, 0.12)
              : "transparent",
          }}
        >
          <Badge
            badgeContent={formatBadge(unread)}
            color="warning"
            overlap="circular"
            invisible={unread === 0}
          >
            <NotificationsRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 380,
              maxWidth: "calc(100vw - 32px)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: getSurfaceBackground(theme, 0.98),
              boxShadow: theme.shadows[8],
              overflow: "hidden",
            },
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontWeight: 700 }}>Notifications</Typography>
            {unread > 0 && (
              <Chip
                size="small"
                label={`${formatBadge(unread)} new`}
                sx={{
                  height: 20,
                  fontWeight: 700,
                  bgcolor: alpha("#d97706", 0.16),
                  color: "#d97706",
                }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={0.5}>
            {unread > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllRead}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "primary.main",
                }}
              >
                Mark all read
              </Button>
            )}
            {items.length > 0 && (
              <Button
                size="small"
                onClick={handleClearAll}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                Clear all
              </Button>
            )}
          </Stack>
        </Stack>

        {mutationError && (
          <Box
            sx={{
              px: 2,
              py: 1,
              fontSize: 12,
              color: "#b91c1c",
              bgcolor: alpha("#dc2626", 0.08),
              borderBottom: "1px solid",
              borderColor: "divider",
              cursor: "pointer",
            }}
            onClick={() => dispatch(clearMutationError())}
          >
            {mutationError} (tap to dismiss)
          </Box>
        )}

        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          {loading && items.length === 0 ? (
            <Box sx={{ px: 2, py: 5, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Loading notifications…
              </Typography>
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ px: 2, py: 5, textAlign: "center" }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>🔔</Typography>
              <Typography variant="body2" color="text.secondary">
                You&apos;re all caught up!
              </Typography>
            </Box>
          ) : (
            items.map((notification) => {
              const accent =
                TYPE_COLORS[notification.type] || theme.palette.primary.main;
              const primaryActionType = notification.action_type;
              const primaryLabel = primaryActionType
                ? ACTION_LABELS[primaryActionType] ||
                  primaryActionType.replace(/_/g, " ")
                : null;
              const primaryColor = primaryActionType
                ? ACTION_COLORS[primaryActionType] || accent
                : accent;
              const timeLabel = formatRelativeTime(notification.created_at);

              return (
                <Box
                  key={notification.id}
                  onClick={() => handleCardClick(notification)}
                  sx={{
                    px: 2,
                    py: 1.25,
                    cursor: "pointer",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: notification.is_read
                      ? "transparent"
                      : alpha(theme.palette.primary.main, 0.05),
                    transition: "background 0.15s",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: alpha(accent, 0.15),
                        color: accent,
                        border: "1px solid",
                        borderColor: alpha(accent, 0.25),
                        fontSize: 18,
                      }}
                    >
                      {resolveIcon(notification.icon)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Typography
                          sx={{
                            fontWeight: notification.is_read ? 600 : 700,
                            fontSize: 13,
                            lineHeight: 1.3,
                            color: notification.is_read
                              ? "text.secondary"
                              : "text.primary",
                          }}
                        >
                          {notification.title}
                          {!notification.is_read && (
                            <Box
                              component="span"
                              sx={{
                                display: "inline-block",
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                                ml: 0.75,
                                verticalAlign: "middle",
                              }}
                            />
                          )}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
                        >
                          {timeLabel}
                        </Typography>
                      </Stack>
                      {notification.body && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mt: 0.5,
                            lineHeight: 1.45,
                          }}
                        >
                          {notification.body}
                        </Typography>
                      )}
                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ mt: 1 }}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        {primaryLabel && (
                          <Button
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handlePrimaryAction(notification);
                            }}
                            sx={{
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: 11,
                              px: 1.25,
                              py: 0.25,
                              minHeight: 0,
                              color: primaryColor,
                              border: "1px solid",
                              borderColor: alpha(primaryColor, 0.35),
                              bgcolor: alpha(primaryColor, 0.12),
                              "&:hover": {
                                bgcolor: alpha(primaryColor, 0.18),
                                borderColor: primaryColor,
                              },
                            }}
                          >
                            {primaryLabel}
                          </Button>
                        )}
                        <Button
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleSnooze(notification);
                          }}
                          sx={{
                            textTransform: "none",
                            fontSize: 11,
                            px: 1.25,
                            py: 0.25,
                            minHeight: 0,
                            color: "#d97706",
                            border: "1px solid",
                            borderColor: alpha("#d97706", 0.35),
                          }}
                        >
                          ⏸ Snooze 1h
                        </Button>
                        <Button
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDismiss(notification);
                          }}
                          sx={{
                            textTransform: "none",
                            fontSize: 11,
                            px: 1.25,
                            py: 0.25,
                            minHeight: 0,
                            color: "text.secondary",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          Dismiss
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              );
            })
          )}
        </Box>

        {pushPreview && (
          <>
            <Divider />
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.75 }}
              >
                🔔 Push notification preview (as it appears in your
                notification shade)
              </Typography>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.6),
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <Typography sx={{ fontSize: 12 }}>🌿</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 12 }}>
                    AyuMonk
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: "auto" }}
                  >
                    {formatRelativeTime(pushPreview.created_at) || "now"}
                  </Typography>
                </Stack>
                <Typography sx={{ fontWeight: 600, fontSize: 12, mb: 0.25 }}>
                  {resolveIcon(pushPreview.icon)} {pushPreview.title}
                </Typography>
                {pushPreview.body && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    {pushPreview.body}
                  </Typography>
                )}
                <Stack direction="row" spacing={0.75}>
                  <Button
                    size="small"
                    fullWidth
                    onClick={() => handlePrimaryAction(pushPreview)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 11,
                      color: "#16a34a",
                      border: "1px solid",
                      borderColor: alpha("#16a34a", 0.4),
                      bgcolor: alpha("#16a34a", 0.15),
                    }}
                  >
                    {pushPreview.action_type
                      ? ACTION_LABELS[pushPreview.action_type] || "Open"
                      : "✓ Mark Done"}
                  </Button>
                  <Button
                    size="small"
                    fullWidth
                    onClick={() => handleSnooze(pushPreview)}
                    sx={{
                      textTransform: "none",
                      fontSize: 11,
                      color: "text.secondary",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    ⏸ Snooze 1h
                  </Button>
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    mt: 0.75,
                    fontSize: 10,
                    opacity: 0.7,
                  }}
                >
                  These buttons work from the notification shade — no need to
                  open the app
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Popover>
    </>
  );
}
