import { useEffect, useMemo, useRef, useState } from "react";
import BedtimeRoundedIcon from "@mui/icons-material/BedtimeRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import LocalDiningRoundedIcon from "@mui/icons-material/LocalDiningRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Layout from "../../layouts/commonLayout/Layout";
import DashboardChallenges from "./DashboardChallenges";
import {
  fetchDashboardKpis,
  fetchSessionSuggestions,
} from "../../store/dashboardSlice";
import { fetchMySubmissions } from "../../store/sessionSlice";
import { getRaisedGradient, getSurfaceBackground } from "../../theme";

const METRIC_ICON_SET = [
  <BedtimeRoundedIcon fontSize="small" />,
  <PsychologyRoundedIcon fontSize="small" />,
  <LocalDiningRoundedIcon fontSize="small" />,
  <WaterDropRoundedIcon fontSize="small" />,
  <SpaRoundedIcon fontSize="small" />,
  <DirectionsRunRoundedIcon fontSize="small" />,
  <SelfImprovementRoundedIcon fontSize="small" />,
  <BoltRoundedIcon fontSize="small" />,
  <FavoriteRoundedIcon fontSize="small" />,
];

const METRIC_COLOR_SET = [
  "#7c3aed",
  "#ea580c",
  "#0f766e",
  "#0284c7",
  "#ca8a04",
  "#c026d3",
  "#16a34a",
  "#d946ef",
  "#2563eb",
];

const CHALLENGE_TYPE_COLORS = {
  counter: "#f97316",
  toggle: "#ec4899",
  choice: "#2563eb",
  multi: "#eab308",
  timer: "#8b5cf6",
  rating: "#14b8a6",
};

const formatMetricLabel = (name = "") =>
  name
    .replace(/\bKPI\b/gi, "")
    .replace(/\s+/g, " ")
    .trim() || "Wellness KPI";

const clampPercent = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(100, Math.max(0, number));
};

const formatChange = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "No trend";
  return `${number >= 0 ? "+" : ""}${number.toFixed(0)}%`;
};

const getMetricIcon = (index) => METRIC_ICON_SET[index % METRIC_ICON_SET.length];
const getMetricColor = (index) => METRIC_COLOR_SET[index % METRIC_COLOR_SET.length];
const getChallengeColor = (challengeType, index) =>
  CHALLENGE_TYPE_COLORS[String(challengeType || "").toLowerCase()] ||
  METRIC_COLOR_SET[index % METRIC_COLOR_SET.length];

const SUGGESTION_TYPE_COLORS = {
  aahar: "#16a34a",
  vihara: "#2563eb",
  nidra: "#7c3aed",
  charya: "#f59e0b",
  manas: "#c026d3",
  ojas: "#0f766e",
};

const getSuggestionColor = (type, index) =>
  SUGGESTION_TYPE_COLORS[String(type || "").toLowerCase()] ||
  METRIC_COLOR_SET[index % METRIC_COLOR_SET.length];

const getChallengeTypeOptions = (challengeType) => {
  const type = String(challengeType || "").toLowerCase();

  if (type === "choice") {
    return ["Option 1", "Option 2", "Option 3"];
  }

  if (type === "multi") {
    return ["Choice 1", "Choice 2", "Choice 3"];
  }

  if (type === "rating") {
    return ["😞", "😕", "😐", "🙂", "😄"];
  }

  if (type === "toggle") {
    return ["Mark Complete"];
  }

  return [];
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

const highlightStats = [
  {
    label: "Wellness score",
    value: "92.5",
    note: "Up from last check-in",
    color: "#0f766e",
    icon: <MonitorHeartRoundedIcon fontSize="small" />,
  },
  {
    label: "XP today",
    value: "340 pts",
    note: "6 of 8 focus steps complete",
    color: "#c2410c",
    icon: <StarsRoundedIcon fontSize="small" />,
  },
  {
    label: "Current level",
    value: "Banyan Sapling",
    note: "3 more days to next milestone",
    color: "#4d7c0f",
    icon: <WorkspacePremiumRoundedIcon fontSize="small" />,
  },
  {
    label: "Active streak",
    value: "7 days",
    note: "Consistency is driving recovery",
    color: "#1d4ed8",
    icon: <EmojiEventsRoundedIcon fontSize="small" />,
  },
];

const trendData = [
  { name: "W1", social: 2.8, hydration: 3.2, energy: 3.4 },
  { name: "W2", social: 3.0, hydration: 3.5, energy: 3.6 },
  { name: "W3", social: 3.2, hydration: 3.7, energy: 3.8 },
  { name: "W4", social: 3.5, hydration: 4.0, energy: 4.0 },
  { name: "W5", social: 3.8, hydration: 4.2, energy: 4.1 },
  { name: "W6", social: 4.0, hydration: 4.4, energy: 4.3 },
  { name: "W7", social: 4.3, hydration: 4.5, energy: 4.4 },
  { name: "W8", social: 4.6, hydration: 4.7, energy: 4.5 },
];

const wellnessIndexData = [
  { name: "Sleep", value: 14, color: "#7c3aed" },
  { name: "Stress", value: 10, color: "#ea580c" },
  { name: "Nutrition", value: 16, color: "#16a34a" },
  { name: "Hydration", value: 12, color: "#0284c7" },
  { name: "Digestion", value: 11, color: "#65a30d" },
  { name: "Activity", value: 13, color: "#f59e0b" },
  { name: "Pain/Posture", value: 9, color: "#c026d3" },
  { name: "Energy", value: 15, color: "#ca8a04" },
];

const doshaData = [
  { name: "Vata", value: 30, color: "#0ea5e9" },
  { name: "Pitta", value: 34, color: "#f97316" },
  { name: "Kapha", value: 36, color: "#22c55e" },
];

const focusActions = [
  {
    title: "Hydration Mission",
    caption: "Progress KPI",
    detail: "Drink 8 glasses today. You're almost there.",
    accent: "#0284c7",
    progress: 75,
    value: "6 / 8",
  },
  {
    title: "Sleep Before 10 PM",
    caption: "Recovery KPI",
    detail: "One focused habit is improving your sleep consistency.",
    accent: "#7c3aed",
    progress: 68,
    value: "Committed",
  },
  {
    title: "Move Your Body",
    caption: "Activity KPI",
    detail: "Add one quick walk or light session before evening.",
    accent: "#f59e0b",
    progress: 52,
    value: "15 min",
  },
];

const leaderboard = [
  { name: "Priya S.", team: "Engineering - Delhi", delta: "+42%" },
  { name: "Rahul M.", team: "Product - Mumbai", delta: "+38%" },
  { name: "Anjali K.", team: "HR - BLR", delta: "+35%" },
  { name: "Amit R.", team: "Finance - Delhi", delta: "+31%", current: true },
  { name: "Sneha P.", team: "Marketing - Pune", delta: "+28%" },
];

const challengeBadges = [
  { id: "h1", label: "Hydration Hero", icon: "💧", earned: true, level: "Gold", color: "#0284c7" },
  { id: "s1", label: "Sleep Master", icon: "🌙", earned: true, level: "Silver", color: "#7c3aed" },
  { id: "st", label: "Stress Buster", icon: "🧘", earned: false, level: "Bronze", color: "#ea580c" },
  { id: "g1", label: "Green Eater", icon: "🥗", earned: true, level: "Bronze", color: "#16a34a" },
  { id: "a1", label: "Active Star", icon: "🏃", earned: false, level: "Silver", color: "#f59e0b" },
  { id: "b1", label: "Banyan Legend", icon: "🌳", earned: false, level: "Legend", color: "#ca8a04" },
];

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

function MetricCard({ item }) {
  const theme = useTheme();
  const trendPositive = item.change.startsWith("+");

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(item.color, 0.22),
        background: `linear-gradient(180deg, ${alpha(item.color, theme.palette.mode === "dark" ? 0.16 : 0.08)} 0%, ${getRaisedGradient(theme, item.color)} 100%)`,
        height: "100%",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(item.color, 0.12),
            color: item.color,
          }}
        >
          {item.icon}
        </Box>
        <Chip
          label={item.change}
          size="small"
          sx={{
            bgcolor: trendPositive ? alpha("#16a34a", 0.14) : alpha("#dc2626", 0.12),
            color: trendPositive ? "#15803d" : "#dc2626",
            fontWeight: 700,
          }}
        />
      </Stack>

      <Typography
        variant="body2"
        sx={{ mt: 1.5, color: item.color, fontWeight: 700 }}
      >
        {item.label}
      </Typography>
      <Typography
        variant="h4"
        sx={{ mt: 0.5, fontWeight: 800, color: item.color }}
      >
        {item.score}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={item.progress}
        sx={{
          mt: 2,
          height: 8,
          borderRadius: 999,
          bgcolor: alpha(item.color, 0.12),
          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
            bgcolor: item.color,
            backgroundImage: `linear-gradient(90deg, ${item.color} 0%, ${alpha(item.color, 0.72)} 100%)`,
          },
        }}
      />
    </Paper>
  );
}

function HighlightStat({ item }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(item.color, 0.18),
        bgcolor: alpha(item.color, 0.04),
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Avatar
          sx={{
            bgcolor: alpha(item.color, 0.14),
            color: item.color,
            width: 36,
            height: 36,
          }}
        >
          {item.icon}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {item.label}
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              color: item.color,
              fontSize: item.value.length > 10 ? 22 : 30,
              lineHeight: 1.15,
            }}
          >
            {item.value}
          </Typography>
        </Box>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.2 }}>
        {item.note}
      </Typography>
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

function ChallengeDashboardContent() {
  const theme = useTheme();
  const timerRef = useRef(null);
  const [timerOn, setTimerOn] = useState(false);
  const [challengeState, setChallengeState] = useState({
    water: { count: 0 },
    sleep: { done: false },
    activity: { chosen: null },
    nutrition: { chosen: [] },
    breathing: { timer: 120, done: false },
    mood: { rating: null },
  });

  useEffect(() => {
    if (!timerOn || challengeState.breathing.timer <= 0) {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setChallengeState((current) => {
        const nextTimer = current.breathing.timer - 1;
        if (nextTimer <= 0) {
          setTimerOn(false);
          return {
            ...current,
            breathing: {
              ...current.breathing,
              timer: 0,
              done: true,
            },
          };
        }

        return {
          ...current,
          breathing: {
            ...current.breathing,
            timer: nextTimer,
          },
        };
      });
    }, 1000);

    return () => {
      window.clearInterval(timerRef.current);
    };
  }, [challengeState.breathing.timer, timerOn]);

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

  const isDone = (id) => {
    const value = challengeState[id];
    if (id === "water") return value.count >= 8;
    if (id === "sleep") return value.done;
    if (id === "activity") return value.chosen !== null;
    if (id === "nutrition") return value.chosen.length > 0;
    if (id === "breathing") return value.done;
    if (id === "mood") return value.rating !== null;
    return false;
  };

  const getXp = (challenge) => {
    if (!isDone(challenge.id)) return 0;
    if (challenge.id === "nutrition") {
      return Math.round(
        challenge.xp *
          ((challengeState.nutrition.chosen?.length || 0) / challenge.options.length),
      );
    }
    return challenge.xp;
  };

  const completedCount = CHALLENGE_DEFS.filter((challenge) => isDone(challenge.id)).length;
  const earnedXp = CHALLENGE_DEFS.reduce((sum, challenge) => sum + getXp(challenge), 0);

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        {[
          {
            label: "Active streak",
            value: "7 Days",
            note: "Day 8 unlocks a badge",
            color: "#ea580c",
          },
          {
            label: "XP today",
            value: `${340 + earnedXp} pts`,
            note: "Complete all 6 for a bonus",
            color: "#ca8a04",
          },
          {
            label: "Current level",
            value: "Banyan Sapling",
            note: "3 more days to Banyan Tree",
            color: "#4d7c0f",
          },
          {
            label: "Progress",
            value: `${completedCount} / 6`,
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
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 28, fontWeight: 800, color: item.color }}>
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
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Today&apos;s Challenges
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inspired by the client reference: quick daily actions, XP, streaks, and badges.
            </Typography>
          </Box>
          <Chip
            label={`${earnedXp} XP earned today`}
            sx={{
              fontWeight: 700,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
            }}
          />
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
              {completedCount}/6 challenges
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(completedCount / CHALLENGE_DEFS.length) * 100}
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
          {CHALLENGE_DEFS.map((challenge) => {
            const state = challengeState[challenge.id];
            const done = isDone(challenge.id);
            const xp = getXp(challenge);

            return (
              <Grid key={challenge.id} size={{ xs: 12, md: 6, xl: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor: alpha(challenge.color, done ? 0.4 : 0.18),
                    background: done
                      ? `linear-gradient(180deg, ${alpha(challenge.color, 0.08)} 0%, ${getSurfaceBackground(theme, theme.palette.mode === "dark" ? 0.98 : 0.94)} 100%)`
                      : getSurfaceBackground(theme),
                    height: "100%",
                  }}
                >
                  <Stack spacing={1.5} sx={{ height: "100%" }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Typography sx={{ fontSize: 24, lineHeight: 1 }}>{challenge.icon}</Typography>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: done ? challenge.color : "text.primary" }}>
                            {challenge.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: challenge.color, fontWeight: 700 }}>
                            {challenge.kpi} · {challenge.xp} XP
                          </Typography>
                        </Box>
                      </Stack>
                      {done && (
                        <Chip
                          size="small"
                          label={`+${xp} XP`}
                          sx={{
                            bgcolor: alpha(challenge.color, 0.12),
                            color: challenge.color,
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {challenge.desc}
                    </Typography>

                    {challenge.type === "counter" && (
                      <Stack spacing={1.25}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <ChallengeActionButton
                            active={state.count >= challenge.target}
                            color={challenge.color}
                            disabled={state.count >= challenge.target}
                            onClick={() =>
                              updateChallenge(challenge.id, {
                                count: Math.min(challenge.target, state.count + 1),
                              })
                            }
                          >
                            {challenge.actionLabel}
                          </ChallengeActionButton>
                          {state.count > 0 && (
                            <Button
                              variant="outlined"
                              onClick={() =>
                                updateChallenge(challenge.id, {
                                  count: Math.max(0, state.count - 1),
                                })
                              }
                              sx={{ minWidth: 0, px: 1.25, borderRadius: 2.5 }}
                            >
                              -
                            </Button>
                          )}
                          <Typography sx={{ fontWeight: 800, color: challenge.color }}>
                            {state.count} / {challenge.target}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(state.count / challenge.target) * 100}
                          sx={{
                            height: 7,
                            borderRadius: 999,
                            bgcolor: alpha(challenge.color, 0.12),
                            "& .MuiLinearProgress-bar": {
                              bgcolor: challenge.color,
                              borderRadius: 999,
                            },
                          }}
                        />
                      </Stack>
                    )}

                    {challenge.type === "toggle" && (
                      <ChallengeActionButton
                        active={state.done}
                        color={challenge.color}
                        onClick={() => updateChallenge(challenge.id, { done: !state.done })}
                      >
                        {state.done ? `✓ ${challenge.options[0]}` : challenge.options[0]}
                      </ChallengeActionButton>
                    )}

                    {challenge.type === "choice" && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {challenge.options.map((option, index) => (
                          <ChallengeActionButton
                            key={option}
                            active={state.chosen === index}
                            color={challenge.color}
                            onClick={() =>
                              updateChallenge(challenge.id, {
                                chosen: state.chosen === index ? null : index,
                              })
                            }
                          >
                            {option}
                          </ChallengeActionButton>
                        ))}
                      </Stack>
                    )}

                    {challenge.type === "multi" && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {challenge.options.map((option, index) => {
                          const selected = state.chosen.includes(index);
                          return (
                            <ChallengeActionButton
                              key={option}
                              active={selected}
                              color={challenge.color}
                              onClick={() =>
                                updateChallenge(challenge.id, {
                                  chosen: selected
                                    ? state.chosen.filter((value) => value !== index)
                                    : [...state.chosen, index],
                                })
                              }
                            >
                              {option}
                            </ChallengeActionButton>
                          );
                        })}
                      </Stack>
                    )}

                    {challenge.type === "timer" && (
                      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                        {!state.done ? (
                          <>
                            <ChallengeActionButton
                              active={timerOn}
                              color={challenge.color}
                              disabled={timerOn}
                              onClick={() => setTimerOn(true)}
                            >
                              {timerOn ? "Breathing..." : "Start Timer"}
                            </ChallengeActionButton>
                            <Typography
                              sx={{
                                fontFamily: "monospace",
                                fontWeight: 800,
                                fontSize: 24,
                                color: challenge.color,
                              }}
                            >
                              {formatTimer(state.timer)}
                            </Typography>
                          </>
                        ) : (
                          <Typography sx={{ fontWeight: 700, color: challenge.color }}>
                            Breathing complete. Well done.
                          </Typography>
                        )}
                      </Stack>
                    )}

                    {challenge.type === "rating" && (
                      <Stack direction="row" spacing={1}>
                        {challenge.options.map((emoji, index) => (
                          <Button
                            key={emoji}
                            variant={state.rating === index ? "contained" : "outlined"}
                            onClick={() => updateChallenge(challenge.id, { rating: index })}
                            sx={{
                              minWidth: 0,
                              px: 1.2,
                              fontSize: 24,
                              lineHeight: 1,
                              borderRadius: 2.5,
                              borderColor: alpha(challenge.color, 0.3),
                              bgcolor:
                                state.rating === index
                                  ? alpha(challenge.color, 0.14)
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
    </Stack>
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("wellness");
  const {
    items: dashboardItems,
    loading: dashboardLoading,
    error: dashboardError,
    suggestions,
    suggestionsLoading,
    suggestionsError,
  } = useSelector((state) => state.dashboard);
  const { mySubmissions } = useSelector((state) => state.session);
  const chartTooltipStyles = {
    contentStyle: {
      backgroundColor: getSurfaceBackground(theme, 0.98),
      border: `1px solid ${alpha(theme.palette.divider, 1)}`,
      borderRadius: 12,
      boxShadow: theme.shadows[8],
    },
    labelStyle: {
      color: theme.palette.text.secondary,
      fontWeight: 700,
    },
    itemStyle: {
      color: theme.palette.text.primary,
    },
  };

  useEffect(() => {
    dispatch(fetchDashboardKpis());
    dispatch(fetchMySubmissions());
  }, [dispatch]);

  const latestSubmissionSessionId = useMemo(() => {
    if (!mySubmissions.length) return "";
    return mySubmissions[0]?.session_id || "";
  }, [mySubmissions]);

  useEffect(() => {
    if (!latestSubmissionSessionId) return;
    dispatch(fetchSessionSuggestions(latestSubmissionSessionId));
  }, [dispatch, latestSubmissionSessionId]);

  const metrics = useMemo(
    () =>
      dashboardItems.map((item, index) => ({
        label: formatMetricLabel(item.kpi_name),
        score: Number(item.latest_score) || 0,
        progress: clampPercent(item.latest_score),
        change: formatChange(item.trend_percent),
        color: getMetricColor(index),
        icon: getMetricIcon(index),
      })),
    [dashboardItems],
  );

  const challengeItems = useMemo(
    () =>
      dashboardItems.flatMap((item) =>
        (Array.isArray(item.challenges) ? item.challenges : []).map((challenge, challengeIndex) => ({
          ...challenge,
          kpi_name: item.kpi_name,
          displayColor: getChallengeColor(challenge.challenge_type, challengeIndex),
        })),
      ),
    [dashboardItems],
  );

  const suggestionItems = useMemo(() => {
    return Array.isArray(suggestions?.items) ? suggestions.items : [];
  }, [suggestions]);

  const suggestionTierLabels = useMemo(() => {
    const triggerModes = new Set(
      suggestionItems.flatMap((item) =>
        (item.triggers || []).map((trigger) => trigger.trigger_mode),
      ),
    );

    return {
      hasKpiRisk: triggerModes.has("kpi_risk"),
      hasQuestionScore: triggerModes.has("question_score"),
    };
  }, [suggestionItems]);
const latestResponse = useMemo(() => {
  return mySubmissions?.[0]?.responses?.[0] || null;
}, [mySubmissions]);

const dynamicWellnessData = useMemo(() => {
  if (!latestResponse) return [];

  return latestResponse.kpi_scores.map((kpi, index) => ({
    name: kpi.kpi_name,
    value: Number((kpi.average_score * 20).toFixed(1)), // convert 0–5 → %
    rawScore: kpi.average_score,
    color: getMetricColor(index),
  }));
}, [latestResponse]);

const overallWellnessScore = useMemo(() => {
  if (!latestResponse) return 0;

  const scores = latestResponse.kpi_scores.map(k => k.average_score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  return Number((avg * 20).toFixed(1)); // scale to /100
}, [latestResponse]);

const dynamicTrendData = useMemo(() => {
  if (!mySubmissions?.length) return [];

  return mySubmissions.map((session, index) => {
    const res = session.responses?.[0];
    const row = { name: `S${index + 1}` };

    res?.kpi_scores?.forEach((kpi) => {
      row[kpi.kpi_name] = kpi.average_score;
    });

    return row;
  });
}, [mySubmissions]);
  return (
    <Layout role="user" title="Wellness Dashboard">
      <Stack spacing={2.5}>
        <SectionCard
          sx={{
            overflow: "hidden",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.12)} 0%, ${getSurfaceBackground(theme, theme.palette.mode === "dark" ? 0.96 : 0.92)} 52%, ${alpha("#f59e0b", theme.palette.mode === "dark" ? 0.18 : 0.1)} 100%)`,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -40,
              right: -30,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.12)}, transparent 68%)`,
            }}
          />
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={2}
            alignItems={{ lg: "center" }}
            sx={{ position: "relative" }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ color: "primary.main", fontWeight: 700 }}
              >
                Personal Wellness Journey
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                Welcome back, Ayumonk User
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
                Switch between your personal wellness overview and the daily
                challenge experience requested in the client reference, while
                keeping the existing dashboard theme intact.
              </Typography>
            </Box>
            <Stack spacing={1} sx={{ minWidth: { md: 320 } }}>
              <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value)}
                variant="fullWidth"
                sx={{
                  minHeight: 46,
                  p: 0.5,
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.05 : 0.55),
                  "& .MuiTabs-flexContainer": {
                    gap: 0.5,
                  },
                  "& .MuiTabs-indicator": {
                    display: "none",
                  },
                }}
              >
                <Tab
                  value="wellness"
                  label="My Wellness"
                  sx={{
                    minHeight: 40,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    color: activeTab === "wellness" ? "primary.main" : "text.secondary",
                    bgcolor:
                      activeTab === "wellness"
                        ? alpha(theme.palette.primary.main, 0.12)
                        : "transparent",
                  }}
                />
                <Tab
                  value="challenges"
                  label="Challenges"
                  sx={{
                    minHeight: 40,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    color: activeTab === "challenges" ? "primary.main" : "text.secondary",
                    bgcolor:
                      activeTab === "challenges"
                        ? alpha(theme.palette.primary.main, 0.12)
                        : "transparent",
                  }}
                />
              </Tabs>
              <Typography variant="body2" color="text.secondary">
                {activeTab === "wellness"
                  ? "Personal wellness journey, trends, dosha balance, and suggestions."
                  : "Daily challenges with quick actions, XP progress, badges, and leaderboard."}
              </Typography>
            </Stack>
          </Stack>
        </SectionCard>

        {activeTab === "wellness" && (
          <>
            {dashboardError && <Alert severity="error">{dashboardError}</Alert>}

            {!dashboardError && dashboardLoading && (
              <SectionCard>
                <Typography>Loading wellness metrics...</Typography>
              </SectionCard>
            )}

            {!dashboardError && !dashboardLoading && metrics.length > 0 && (
              <Grid container spacing={2}>
                {metrics.map((item) => (
                  <Grid
                    key={item.label}
                    size={{ xs: 12, sm: 4, md: 2, lg: 7 / 4, xl: 4 / 3 }}
                  >
                    <MetricCard item={item} />
                  </Grid>
                ))}
              </Grid>
            )}

            {!dashboardError && !dashboardLoading && metrics.length === 0 && (
              <SectionCard>
                <Typography>No KPI metrics are available for your dashboard yet.</Typography>
              </SectionCard>
            )}

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 8.2 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 4.4 }}>
                <SectionCard sx={{ height: "100%" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Wellness Index
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Overall score based on your key wellness factors
                  </Typography>

                  <Box sx={{ position: "relative", height: 230 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dynamicWellnessData}
                          dataKey="value"
                          innerRadius={62}
                          outerRadius={90}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {dynamicWellnessData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                          {overallWellnessScore}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          / 100
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    useFlexGap
                    spacing={1}
                    sx={{ rowGap: 1, mt: 1 }}
                  >
                    {wellnessIndexData.map((item) => (
                      <Stack
                        key={item.name}
                        direction="row"
                        spacing={0.8}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: item.color,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {item.name}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Chip
                    label="43% improvement from baseline"
                    sx={{
                      mt: 2,
                      bgcolor: alpha("#16a34a", 0.1),
                      color: "#15803d",
                      fontWeight: 700,
                    }}
                  />
                </SectionCard>
              </Grid>

              <Grid size={{ xs: 12, lg: 7.6 }}>
                <SectionCard sx={{ height: "100%" }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ sm: "center" }}
                    spacing={1.5}
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Wellness Trends
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Weekly movement across your strongest improvement areas
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip label="Daily" size="small" variant="outlined" />
                      <Chip label="Weekly" size="small" color="primary" />
                      <Chip label="Monthly" size="small" variant="outlined" />
                    </Stack>
                  </Stack>

                  <ResponsiveContainer width="100%" height={290}>
                    <LineChart data={dynamicTrendData}>
                      <XAxis dataKey="name" />
                      <YAxis domain={[2, 5]} />
                      <Tooltip {...chartTooltipStyles} />
                    {dynamicWellnessData.map((kpi, index) => (
  <Line
    key={kpi.name}
    type="monotone"
    dataKey={kpi.name}
    stroke={kpi.color}
    strokeWidth={3}
    dot={false}
  />
))}
                    </LineChart>
                  </ResponsiveContainer>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{ mt: 1.5 }}
                  >
                    <Chip
                      label="Social +17%"
                      sx={{
                        bgcolor: alpha("#d946ef", 0.1),
                        color: "#a21caf",
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      label="Hydration +15%"
                      sx={{
                        bgcolor: alpha("#0284c7", 0.1),
                        color: "#0369a1",
                        fontWeight: 700,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Most stable gains are showing up in hydration and
                      recovery.
                    </Typography>
                  </Stack>
                </SectionCard>
              </Grid>

            </Grid>
          </Grid>

          <Grid size={{ xs: 12, lg: 3.8 }}>
            <Stack spacing={2.5}>
              <SectionCard>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Dosha Profile
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Balanced composition based on the latest assessment
                </Typography>

                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={doshaData}
                      dataKey="value"
                      innerRadius={48}
                      outerRadius={82}
                      stroke="none"
                    >
                      {doshaData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <Stack spacing={1.2}>
                  {doshaData.map((item) => (
                    <Stack
                      key={item.name}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: item.color,
                          }}
                        />
                        <Typography variant="body2">{item.name}</Typography>
                      </Stack>
                      <Typography sx={{ fontWeight: 700, color: item.color }}>
                        {item.value}%
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Today&apos;s Mood Check
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                >
                  {["Sad", "Low", "Okay", "Good", "Great"].map(
                    (label, index) => (
                      <Chip
                        key={label}
                        label={label}
                        color={index === 3 ? "primary" : "default"}
                        variant={index === 3 ? "filled" : "outlined"}
                        sx={{ minWidth: 0 }}
                      />
                    ),
                  )}
                </Stack>
              </SectionCard>

            </Stack>
          </Grid>
        </Grid>

        <SectionCard>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Lifestyle Suggestions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Focus areas this week based on your latest session insights
              </Typography>
            </Box>
            {(suggestionTierLabels.hasKpiRisk ||
              suggestionTierLabels.hasQuestionScore) && (
              <Stack direction="row" spacing={1}>
                {suggestionTierLabels.hasKpiRisk && (
                  <Chip
                    label="Tier 1 - KPI risk"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )}
                {suggestionTierLabels.hasQuestionScore && (
                  <Chip
                    label="Tier 2 - Question score"
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>
            )}
          </Stack>

          {suggestionsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {suggestionsError}
            </Alert>
          )}

          {suggestionsLoading && (
            <Typography>Loading lifestyle suggestions...</Typography>
          )}

          {!suggestionsLoading && suggestionItems.length === 0 && (
            <Typography color="text.secondary">
              No lifestyle suggestions are available yet.
            </Typography>
          )}

          {!suggestionsLoading && suggestionItems.length > 0 && (
            <Grid container spacing={2}>
              {suggestionItems.map((item, index) => {
                const accent = getSuggestionColor(item.suggestion_type, index);
                const triggerBadges = (item.triggers || [])
                  .sort((left, right) => (left.priority || 0) - (right.priority || 0))
                  .slice(0, 2);

                return (
                  <Grid key={item.suggestion_id || item.title} size={{ xs: 12, md: 4 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        borderLeft: `4px solid ${accent}`,
                        height: "100%",
                      }}
                    >
                      <Stack spacing={1.4}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography sx={{ fontWeight: 800, color: accent }}>
                            {item.title}
                          </Typography>
                        </Stack>

                        {!!item.description && (
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {!!item.suggestion_type && (
                            <Chip
                              label={item.suggestion_type}
                              size="small"
                              sx={{ fontWeight: 700 }}
                            />
                          )}
                          {!!item.difficulty && (
                            <Chip
                              label={item.difficulty}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {!!item.duration_mins && (
                            <Chip
                              label={`${item.duration_mins} mins`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {!!item.dosha_type && (
                            <Chip
                              label={`Dosha: ${item.dosha_type}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                        {!!triggerBadges.length && (
                          <Stack spacing={0.8}>
                            {triggerBadges.map((trigger, triggerIndex) => (
                              <Box
                                key={`${item.suggestion_id}-trigger-${triggerIndex}`}
                                sx={{
                                  p: 1,
                                  borderRadius: 2,
                                  bgcolor: alpha(accent, 0.06),
                                }}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  {trigger.trigger_mode === "kpi_risk"
                                    ? `KPI risk: ${trigger.kpi_display_name || trigger.kpi_key} (${trigger.risk_level || "risk"})`
                                    : `Question: ${trigger.question_text || trigger.question_key} (${trigger.question_score || 0})`}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        )}

                        {!!item.url && (
                          <Button
                            variant="outlined"
                            size="small"
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            sx={{ alignSelf: "flex-start" }}
                          >
                            View Resource
                          </Button>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </SectionCard>
          </>
        )}

        {activeTab === "challenges" && (
          <DashboardChallenges
            challenges={challengeItems}
            loading={dashboardLoading}
            error={dashboardError}
          />
        )}
      </Stack>
    </Layout>
  );
}
