import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  clearDashboardChallengeActionError,
  fetchDashboardKpis,
  postDashboardChallengeAction,
} from "../../store/dashboardSlice";
import { getRaisedGradient, getSurfaceBackground } from "../../theme";
import ReminderSettings from "./ReminderSettings";

const challengeBadges = [
  { id: "h1", label: "Hydration Hero", icon: "💧", earned: true, level: "Gold", color: "#0284c7" },
  { id: "s1", label: "Sleep Master", icon: "🌙", earned: true, level: "Silver", color: "#7c3aed" },
  { id: "st", label: "Stress Buster", icon: "🧘", earned: false, level: "Bronze", color: "#ea580c" },
  { id: "g1", label: "Green Eater", icon: "🥗", earned: true, level: "Bronze", color: "#16a34a" },
  { id: "a1", label: "Active Star", icon: "🏃", earned: false, level: "Silver", color: "#f59e0b" },
  { id: "b1", label: "Banyan Legend", icon: "🌳", earned: false, level: "Legend", color: "#ca8a04" },
];

const leaderboard = [
  { name: "Priya S.", team: "Engineering - Delhi", delta: "+42%" },
  { name: "Rahul M.", team: "Product - Mumbai", delta: "+38%" },
  { name: "Anjali K.", team: "HR - BLR", delta: "+35%" },
  { name: "Amit R.", team: "Finance - Delhi", delta: "+31%", current: true },
  { name: "Sneha P.", team: "Marketing - Pune", delta: "+28%" },
];

const CHALLENGE_TYPE_ACCENTS = {
  counter: { primary: "#f97316", secondary: "#fb7185" },
  toggle: { primary: "#ec4899", secondary: "#f97316" },
  choice: { primary: "#2563eb", secondary: "#7c3aed" },
  multi: { primary: "#eab308", secondary: "#f59e0b" },
  timer: { primary: "#8b5cf6", secondary: "#06b6d4" },
  rating: { primary: "#14b8a6", secondary: "#f59e0b" },
};

const createChallengeStateFromItems = (challenges) =>
  challenges.reduce((accumulator, challenge) => {
    const challengeType = String(challenge.challenge_type || "").toLowerCase();

    accumulator[challenge.challenge_key] = {
      count: 0,
      done: false,
      chosen: challengeType === "multi" ? [] : null,
      timer: challengeType === "timer" ? Math.max(1, Number(challenge.target_value) || 60) : 0,
      rating: null,
    };

    return accumulator;
  }, {});

const getChallengeTypeOptions = (challengeType) => {
  const type = String(challengeType || "").toLowerCase();

  if (type === "choice") return ["Option 1", "Option 2", "Option 3"];
  if (type === "multi") return ["Choice 1", "Choice 2", "Choice 3"];
  if (type === "rating") return ["😞", "😕", "😐", "🙂", "😄"];
  if (type === "toggle") return ["Mark Complete"];

  return [];
};

function SectionCard({ children, sx }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: getSurfaceBackground(theme),
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function ChallengeActionButton({
  active = false,
  color,
  children,
  disabled = false,
  onClick,
}) {
  return (
    <Button
      variant={active ? "contained" : "outlined"}
      onClick={onClick}
      disabled={disabled}
      sx={{
        textTransform: "none",
        fontWeight: 700,
        borderRadius: 2.5,
        color: active ? "#fff" : color,
        borderColor: alpha(color, 0.35),
        bgcolor: active ? color : alpha(color, 0.06),
        "&:hover": {
          borderColor: color,
          bgcolor: active ? color : alpha(color, 0.12),
        },
      }}
    >
      {children}
    </Button>
  );
}

export default function DashboardChallenges({ challenges, loading, error }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const timerRef = useRef(null);
  const [activeTimerKey, setActiveTimerKey] = useState("");
  const [challengeState, setChallengeState] = useState({});
  const { actionLoadingById, actionErrorById, actionResultById } = useSelector(
    (state) => state.dashboard,
  );

  useEffect(() => {
    setChallengeState((current) => ({
      ...createChallengeStateFromItems(challenges),
      ...current,
    }));
  }, [challenges]);

  useEffect(() => {
    if (!activeTimerKey || !challengeState[activeTimerKey]?.timer) {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setChallengeState((current) => {
        const nextTimer = (current[activeTimerKey]?.timer || 0) - 1;

        if (nextTimer <= 0) {
          const completedChallenge = challenges.find(
            (item) => item.challenge_key === activeTimerKey,
          );
          setActiveTimerKey("");
          if (completedChallenge) {
            void handleChallengeAction(completedChallenge, {
              timer_seconds: Math.max(1, Number(completedChallenge.target_value) || 1),
              value_logged: Math.max(1, Number(completedChallenge.target_value) || 1),
            });
          }
          return {
            ...current,
            [activeTimerKey]: {
              ...current[activeTimerKey],
              timer: 0,
              done: true,
            },
          };
        }

        return {
          ...current,
          [activeTimerKey]: {
            ...current[activeTimerKey],
            timer: nextTimer,
          },
        };
      });
    }, 1000);

    return () => window.clearInterval(timerRef.current);
  }, [activeTimerKey, challengeState, challenges]);

  useEffect(() => () => window.clearInterval(timerRef.current), []);

  const updateChallenge = (id, payload) => {
    setChallengeState((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...payload,
      },
    }));
  };

  const formatTimer = (seconds) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const handleChallengeAction = async (challenge, values) => {
    dispatch(clearDashboardChallengeActionError(challenge.challenge_key));

    const payload = {
      challenge_id: challenge.challenge_key,
      value_logged: 0,
      toggle_value: false,
      choice_value: 0,
      multi_values: [],
      timer_seconds: 0,
      rating_value: 0,
      ...values,
    };

    const result = await dispatch(postDashboardChallengeAction(payload));
    if (postDashboardChallengeAction.fulfilled.match(result)) {
      dispatch(fetchDashboardKpis());
    }
    return result;
  };

  const isDone = (challenge) => {
    const state = challengeState[challenge.challenge_key];
    const challengeType = String(challenge.challenge_type || "").toLowerCase();
    const targetValue = Math.max(1, Number(challenge.target_value) || 1);

    if (!state) return false;
    if (challengeType === "counter") return state.count >= targetValue;
    if (challengeType === "toggle") return state.done;
    if (challengeType === "choice") return state.chosen !== null;
    if (challengeType === "multi") return state.chosen.length > 0;
    if (challengeType === "timer") return state.done;
    if (challengeType === "rating") return state.rating !== null;
    return false;
  };

  const getXp = (challenge) => {
    if (!isDone(challenge)) return 0;

    if (String(challenge.challenge_type || "").toLowerCase() === "multi") {
      const optionCount = Math.max(getChallengeTypeOptions(challenge.challenge_type).length, 1);
      return Math.round(
        (Number(challenge.xp_reward) || 0) *
          ((challengeState[challenge.challenge_key]?.chosen?.length || 0) / optionCount),
      );
    }

    return Number(challenge.xp_reward) || 0;
  };

  const completedCount = challenges.filter((challenge) => isDone(challenge)).length;
  const earnedXp = challenges.reduce((sum, challenge) => sum + getXp(challenge), 0);

  if (loading) {
    return (
      <Stack spacing={2.5}>
        <SectionCard>
          <Typography>Loading challenges...</Typography>
        </SectionCard>
        <ReminderSettings />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2.5}>
        <Alert severity="error">{error}</Alert>
        <ReminderSettings />
      </Stack>
    );
  }

  if (!challenges.length) {
    return (
      <Stack spacing={2.5}>
        <SectionCard>
          <Typography>No active challenges available right now.</Typography>
        </SectionCard>
        <ReminderSettings />
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        {[
          {
            label: "Active streak",
            icon: "🔥",
            value: "7 Days",
            note: "Day 8 unlocks a badge",
            color: "#ea580c",
          },
          {
            label: "XP today",
            icon: "⭐",
            value: `${earnedXp} pts`,
            note: "Earn XP from today's live challenges",
            color: "#ca8a04",
          },
          {
            label: "Current level",
            icon: "🌱",
            value: "Banyan Sapling",
            note: "Challenge progress keeps your streak alive",
            color: "#4d7c0f",
          },
          {
            label: "Progress",
            icon: "✅",
            value: `${completedCount} / ${challenges.length}`,
            note: "Challenges completed today",
            color: "#1d4ed8",
          },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: alpha(item.color, 0.22),
                background: getRaisedGradient(theme, item.color),
                height: "100%",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: `0 12px 28px ${alpha(item.color, 0.18)}`,
                  borderColor: alpha(item.color, 0.42),
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(item.color, 0.14),
                    fontSize: 16,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    fontSize: 10.5,
                  }}
                >
                  {item.label}
                </Typography>
              </Stack>
              <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 800, color: item.color, lineHeight: 1.15 }}>
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                {item.note}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <SectionCard>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 1.5 }}
          alignItems={{ sm: "center" }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Today&apos;s Challenges
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1 to 3 taps each — earn XP, build streaks, unlock badges.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              label={`${challenges.length} active`}
              sx={{
                fontWeight: 700,
                bgcolor: alpha("#16a34a", 0.12),
                color: "#15803d",
                border: "1px solid",
                borderColor: alpha("#16a34a", 0.28),
              }}
            />
            <Chip
              label={`${earnedXp} XP earned today`}
              sx={{
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            />
          </Stack>
        </Stack>

        <Box sx={{ mb: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 0.75 }}
          >
            <Typography variant="caption" color="text.secondary">
              Today&apos;s completion
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {completedCount}/{challenges.length} challenges
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(completedCount / Math.max(challenges.length, 1)) * 100}
            sx={{
              height: 8,
              borderRadius: 999,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
              },
            }}
          />
        </Box>

        <Grid container spacing={2}>
          {challenges.map((challenge) => {
            const challengeType = String(challenge.challenge_type || "").toLowerCase();
            const options = getChallengeTypeOptions(challenge.challenge_type);
            const targetValue = Math.max(1, Number(challenge.target_value) || 1);
            const state =
              challengeState[challenge.challenge_key] ||
              createChallengeStateFromItems([challenge])[challenge.challenge_key];
            const done = isDone(challenge);
            const xp = getXp(challenge);
            const color = challenge.displayColor || challenge.color || theme.palette.primary.main;
            const accent = CHALLENGE_TYPE_ACCENTS[challengeType] || {
              primary: color,
              secondary: theme.palette.primary.main,
            };
            const actionLoading = Boolean(actionLoadingById[challenge.challenge_key]);
            const actionError = actionErrorById[challenge.challenge_key];
            const actionResult = actionResultById[challenge.challenge_key];

            return (
              <Grid key={challenge.challenge_key} size={{ xs: 12, md: 6, xl: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor: alpha(color, done ? 0.4 : 0.18),
                    background: done
                      ? `linear-gradient(180deg, ${alpha(color, 0.08)} 0%, ${getSurfaceBackground(theme, theme.palette.mode === "dark" ? 0.98 : 0.94)} 100%)`
                      : getSurfaceBackground(theme),
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: `0 14px 30px ${alpha(color, 0.18)}`,
                      borderColor: alpha(color, done ? 0.55 : 0.4),
                    },
                  }}
                >
                  {done && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 12,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1.5,
                        bgcolor: alpha(color, 0.16),
                        color,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.3,
                        border: "1px solid",
                        borderColor: alpha(color, 0.32),
                      }}
                    >
                      ✓ +{xp} XP
                    </Box>
                  )}
                  <Stack spacing={1.5} sx={{ height: "100%" }}>
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ pr: done ? 7 : 0 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.75,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: alpha(accent.primary, 0.12),
                          boxShadow: `inset 0 0 0 1px ${alpha(accent.primary, 0.16)}`,
                          flexShrink: 0,
                        }}
                      >
                        <Typography sx={{ fontSize: 24, lineHeight: 1 }}>
                          {challenge.icon || "🎯"}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: 17,
                            lineHeight: 1.2,
                            color: done ? accent.primary : alpha(accent.primary, 0.92),
                            textShadow: done
                              ? `0 0 18px ${alpha(accent.primary, 0.18)}`
                              : "none",
                          }}
                          noWrap
                          title={challenge.name}
                        >
                          {challenge.name}
                        </Typography>
                        <Stack direction="row" spacing={0.75} sx={{ mt: 0.6 }} useFlexGap flexWrap="wrap">
                          {challenge.kpi_name && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: alpha(accent.primary, 0.85),
                                fontWeight: 700,
                                fontSize: 10.5,
                              }}
                            >
                              {challenge.kpi_name} KPI · {Number(challenge.xp_reward) || 0} XP
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Stack>

                    {actionResult?.message && (
                      <Typography
                        variant="caption"
                        sx={{ color: "#15803d", fontWeight: 700 }}
                      >
                        {actionResult.message}
                      </Typography>
                    )}

                    {actionError && (
                      <Alert severity="error" sx={{ py: 0 }}>
                        {actionError}
                      </Alert>
                    )}

                    <Box
                      sx={{
                        px: 1.4,
                        py: 1.15,
                        borderRadius: 2.5,
                        background: `linear-gradient(135deg, ${alpha(accent.primary, 0.06)} 0%, ${alpha(accent.secondary, 0.08)} 100%)`,
                        border: "1px solid",
                        borderColor: alpha(accent.primary, 0.12),
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: alpha(theme.palette.text.primary, 0.78),
                          lineHeight: 1.6,
                        }}
                      >
                        {challenge.description || "Complete this challenge to earn XP."}
                      </Typography>
                    </Box>

                    {challengeType === "counter" && (
                      <Stack spacing={1.25}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <ChallengeActionButton
                            active={state.count >= targetValue}
                            color={color}
                            disabled={state.count >= targetValue || actionLoading}
                            onClick={async () => {
                              const nextCount = Math.min(targetValue, state.count + 1);
                              updateChallenge(challenge.challenge_key, {
                                count: nextCount,
                              });
                              await handleChallengeAction(challenge, {
                                value_logged: nextCount,
                              });
                            }}
                          >
                            {actionLoading ? "Saving..." : "+ 1"}
                          </ChallengeActionButton>
                          {state.count > 0 && (
                            <Button
                              variant="outlined"
                              disabled={actionLoading}
                              onClick={async () => {
                                const nextCount = Math.max(0, state.count - 1);
                                updateChallenge(challenge.challenge_key, {
                                  count: nextCount,
                                });
                                await handleChallengeAction(challenge, {
                                  value_logged: nextCount,
                                });
                              }}
                              sx={{ minWidth: 0, px: 1.25, borderRadius: 2.5 }}
                            >
                              -
                            </Button>
                          )}
                          <Typography sx={{ fontWeight: 800, color }}>
                            {state.count} / {targetValue}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(state.count / targetValue) * 100}
                          sx={{
                            height: 7,
                            borderRadius: 999,
                            bgcolor: alpha(color, 0.12),
                            "& .MuiLinearProgress-bar": {
                              bgcolor: color,
                              backgroundImage: `linear-gradient(90deg, ${accent.primary} 0%, ${accent.secondary} 100%)`,
                              borderRadius: 999,
                            },
                          }}
                        />
                      </Stack>
                    )}

                    {challengeType === "toggle" && (
                      <ChallengeActionButton
                        active={state.done}
                        color={color}
                        disabled={actionLoading}
                        onClick={async () => {
                          const nextDone = !state.done;
                          updateChallenge(challenge.challenge_key, { done: nextDone });
                          await handleChallengeAction(challenge, {
                            toggle_value: nextDone,
                          });
                        }}
                      >
                        {actionLoading
                          ? "Saving..."
                          : state.done
                            ? `✓ ${options[0]}`
                            : options[0]}
                      </ChallengeActionButton>
                    )}

                    {challengeType === "choice" && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {options.map((option, index) => (
                          <ChallengeActionButton
                            key={option}
                            active={state.chosen === index}
                            color={color}
                            disabled={actionLoading}
                            onClick={async () => {
                              const nextChoice =
                                state.chosen === index ? null : index;
                              updateChallenge(challenge.challenge_key, {
                                chosen: nextChoice,
                              });
                              if (nextChoice !== null) {
                                await handleChallengeAction(challenge, {
                                  choice_value: nextChoice,
                                });
                              }
                            }}
                          >
                            {option}
                          </ChallengeActionButton>
                        ))}
                      </Stack>
                    )}

                    {challengeType === "multi" && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {options.map((option, index) => {
                          const selected = state.chosen.includes(index);
                          return (
                            <ChallengeActionButton
                              key={option}
                              active={selected}
                              color={color}
                              disabled={actionLoading}
                              onClick={async () => {
                                const nextValues = selected
                                  ? state.chosen.filter((value) => value !== index)
                                  : [...state.chosen, index];
                                updateChallenge(challenge.challenge_key, {
                                  chosen: nextValues,
                                });
                                await handleChallengeAction(challenge, {
                                  multi_values: nextValues,
                                });
                              }}
                            >
                              {option}
                            </ChallengeActionButton>
                          );
                        })}
                      </Stack>
                    )}

                    {challengeType === "timer" && (
                      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                        {!state.done ? (
                          <>
                            <ChallengeActionButton
                              active={activeTimerKey === challenge.challenge_key}
                              color={color}
                              disabled={Boolean(activeTimerKey) || actionLoading}
                              onClick={() => setActiveTimerKey(challenge.challenge_key)}
                            >
                              {activeTimerKey === challenge.challenge_key ? "Running..." : "Start Timer"}
                            </ChallengeActionButton>
                            <Typography
                              sx={{
                                fontFamily: "monospace",
                                fontWeight: 800,
                                fontSize: 24,
                                color,
                              }}
                            >
                              {formatTimer(state.timer)}
                            </Typography>
                          </>
                        ) : (
                          <Typography sx={{ fontWeight: 700, color }}>
                            Timer complete. Well done.
                          </Typography>
                        )}
                      </Stack>
                    )}

                    {challengeType === "rating" && (
                      <Stack direction="row" spacing={1}>
                        {options.map((emoji, index) => (
                          <Button
                            key={emoji}
                            variant={state.rating === index ? "contained" : "outlined"}
                            disabled={actionLoading}
                            onClick={async () => {
                              updateChallenge(challenge.challenge_key, { rating: index });
                              await handleChallengeAction(challenge, {
                                rating_value: index,
                                value_logged: index,
                              });
                            }}
                            sx={{
                              minWidth: 0,
                              px: 1.2,
                              fontSize: 24,
                              lineHeight: 1,
                              borderRadius: 2.5,
                              borderColor: alpha(color, 0.3),
                              bgcolor:
                                state.rating === index
                                  ? alpha(color, 0.14)
                                  : "transparent",
                            }}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </SectionCard>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard sx={{ height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              My Badges
            </Typography>
            <Grid container spacing={1.5}>
              {challengeBadges.map((badge) => (
                <Grid key={badge.id} size={{ xs: 6, sm: 4 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      textAlign: "center",
                      borderColor: badge.earned ? alpha(badge.color, 0.35) : "divider",
                      bgcolor: badge.earned ? alpha(badge.color, 0.08) : "transparent",
                      opacity: badge.earned ? 1 : 0.45,
                      height: "100%",
                    }}
                  >
                    <Typography sx={{ fontSize: 26 }}>{badge.icon}</Typography>
                    <Typography sx={{ mt: 0.75, fontWeight: 700, color: badge.earned ? badge.color : "text.secondary" }}>
                      {badge.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {badge.level}
                      {!badge.earned ? " Locked" : ""}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard sx={{ height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Weekly Leaderboard
            </Typography>
            <Stack spacing={1.2}>
              {leaderboard.map((item, index) => (
                <Paper
                  key={item.name}
                  variant="outlined"
                  sx={{
                    p: 1.4,
                    borderRadius: 2.5,
                    borderColor: item.current ? alpha("#0f766e", 0.3) : "divider",
                    bgcolor: item.current ? alpha("#0f766e", 0.06) : "transparent",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Typography
                        sx={{
                          width: 24,
                          fontWeight: 800,
                          color: index < 3 ? "#c2410c" : "text.secondary",
                        }}
                      >
                        {index + 1}
                      </Typography>
                      <Box>
                        <Typography sx={{ fontWeight: item.current ? 800 : 700 }}>
                          {item.current ? `You (${item.name})` : item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.team}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: item.current ? "#15803d" : "#0f766e",
                      }}
                    >
                      {item.delta}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <ReminderSettings />
    </Stack>
  );
}
