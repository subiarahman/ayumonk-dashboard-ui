import { Box, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import NightsStayOutlinedIcon from "@mui/icons-material/NightsStayOutlined";
import DirectionsRunOutlinedIcon from "@mui/icons-material/DirectionsRunOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import AirOutlinedIcon from "@mui/icons-material/AirOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import SentimentVeryDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentVeryDissatisfiedOutlined";
import SentimentDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentDissatisfiedOutlined";
import SentimentNeutralOutlinedIcon from "@mui/icons-material/SentimentNeutralOutlined";
import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import SentimentVerySatisfiedOutlinedIcon from "@mui/icons-material/SentimentVerySatisfiedOutlined";
import SelfImprovementOutlinedIcon from "@mui/icons-material/SelfImprovementOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import BedtimeOutlinedIcon from "@mui/icons-material/BedtimeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import Layout from "../../layouts/commonLayout/Layout";

const topNav = ["My Wellness", "Challenges", "HR Analytics"];

const challengeStats = [
  {
    label: "Streak",
    value: "7 Days",
    subtext: "Day 8 unlocks a badge",
    color: "#f7a531",
    icon: <LocalFireDepartmentOutlinedIcon fontSize="small" />,
  },
  {
    label: "XP Today",
    value: "340 pts",
    subtext: "Complete all 6 for bonus",
    color: "#f7b84f",
    icon: <EmojiEventsOutlinedIcon fontSize="small" />,
  },
  {
    label: "Level",
    value: "Banyan Sapling",
    subtext: "3 more days -> Banyan Tree",
    color: "#7ad03a",
    icon: <SpaOutlinedIcon fontSize="small" />,
  },
  {
    label: "Progress",
    value: "0 / 6",
    subtext: "Challenges completed today",
    color: "#5cbf5a",
    icon: <TimelineOutlinedIcon fontSize="small" />,
  },
];

const challengeCards = [
  {
    title: "Hydration Mission",
    subtitle: "hydration KPI • 20 XP available",
    description: "Drink 8 glasses today. Tap + after each glass.",
    icon: <WaterDropOutlinedIcon sx={{ color: "#34c8ff" }} />,
    accent: "#1c8df0",
    action: "+ 1 Glass",
    meta: "0 / 8",
  },
  {
    title: "Sleep Before 10PM",
    subtitle: "sleep KPI • 25 XP available",
    description: "One tap to commit. No screens 1 hr before.",
    icon: <NightsStayOutlinedIcon sx={{ color: "#ffcc3f" }} />,
    accent: "#7952ff",
    action: "Committed to sleep by 10PM ✓",
  },
  {
    title: "Move Your Body",
    subtitle: "activity KPI • 30 XP available",
    description: "Pick what you did today — any one counts!",
    icon: <DirectionsRunOutlinedIcon sx={{ color: "#ff9f3b" }} />,
    accent: "#f7872c",
    pills: ["Walk 15min", "Yoga 20min", "Gym Session"],
  },
  {
    title: "Eat Well Today",
    subtitle: "nutrition KPI • 25 XP available",
    description: "Tap all that apply from today.",
    icon: <RestaurantOutlinedIcon sx={{ color: "#75d64d" }} />,
    accent: "#2bbb5a",
    pills: ["Ate Fruits/Veggies", "Home Cooked Meal"],
  },
  {
    title: "4-7-8 Breathing",
    subtitle: "stress KPI • 20 XP available",
    description: "Inhale 4s -> Hold 7s -> Exhale 8s. 3 cycles. Tap Start.",
    icon: <AirOutlinedIcon sx={{ color: "#ffb14a" }} />,
    accent: "#ff7e1a",
    action: "Start Timer",
    meta: "2:00",
  },
  {
    title: "Daily Mood Check",
    subtitle: "emotional KPI • 10 XP available",
    description: "How are you feeling right now?",
    icon: <FavoriteOutlinedIcon sx={{ color: "#54f46f" }} />,
    accent: "#38c172",
    moods: [
      <SentimentVeryDissatisfiedOutlinedIcon key="sad-2" />,
      <SentimentDissatisfiedOutlinedIcon key="sad-1" />,
      <SentimentNeutralOutlinedIcon key="mid" />,
      <SentimentSatisfiedOutlinedIcon key="happy-1" />,
      <SentimentVerySatisfiedOutlinedIcon key="happy-2" />,
    ],
  },
];

const badges = [
  { name: "Hydration Hero", tier: "Gold", color: "#2db5ff", active: true },
  { name: "Sleep Master", tier: "Silver", color: "#7a67ff", active: true },
  { name: "Stress Buster", tier: "Bronze", color: "#7b5f28", active: false },
  { name: "Green Eater", tier: "Bronze", color: "#3fd05a", active: true },
  { name: "Active Star", tier: "Silver", color: "#f4a33a", active: false },
  { name: "Banyan Legend", tier: "Legend", color: "#3ea651", active: false },
];

const leaderboard = [
  { rank: "1st", name: "Priya S.", meta: "Engineering • Delhi", gain: "+42%" },
  { rank: "2nd", name: "Rahul M.", meta: "Product • Mumbai", gain: "+38%" },
  { rank: "3rd", name: "Anjali K.", meta: "HR • BLR", gain: "+35%" },
  {
    rank: "4th - You",
    name: "Amit R.",
    meta: "Finance • Delhi",
    gain: "+31%",
    highlight: true,
  },
  { rank: "5th", name: "Sneha P.", meta: "Marketing • Pune", gain: "+28%" },
];

const analyticsFilters = ["Department", "Location", "Age Band", "Gender"];

const analyticsStats = [
  {
    label: "Avg Wellness",
    value: "72.3",
    note: "/ 100",
    icon: <SelfImprovementOutlinedIcon fontSize="small" />,
    color: "#77d64d",
  },
  {
    label: "Productivity",
    value: "75.8%",
    note: "self-reported",
    icon: <TrackChangesOutlinedIcon fontSize="small" />,
    color: "#53b5ff",
  },
  {
    label: "Engagement",
    value: "71.5%",
    note: "Gallup Q12",
    icon: <ForumOutlinedIcon fontSize="small" />,
    color: "#9d83ff",
  },
  {
    label: "Absenteeism",
    value: "4.7 d",
    note: "per month",
    icon: <EventBusyOutlinedIcon fontSize="small" />,
    color: "#ff5a4d",
  },
  {
    label: "Sleep Score",
    value: "3.6",
    note: "out of 5",
    icon: <BedtimeOutlinedIcon fontSize="small" />,
    color: "#e1cf59",
  },
  {
    label: "Stress Score",
    value: "3.5",
    note: "lower is better",
    icon: <WbSunnyOutlinedIcon fontSize="small" />,
    color: "#e9a44a",
  },
];

const dimensionBlocks = {
  "By Department": [
    ["Engine", 72.7],
    ["Market", 70.2],
    ["Finance", 73.2],
    ["HR", 72.4],
    ["Operat", 73.4],
    ["Produc", 71.6],
  ],
  "By Location": [
    ["Delhi", 73.6],
    ["Mumbai", 71.7],
    ["Bengal", 72.7],
    ["Hyder", 71.6],
    ["Pune", 70.8],
  ],
};

const performanceBlocks = {
  "By Department": [
    ["Engine", 74.8],
    ["Market", 75.8],
    ["Finance", 76.2],
    ["HR", 77.9],
    ["Operat", 74.5],
    ["Produc", 73.7],
  ],
  "By Age Band": [
    ["20-25", 74.6],
    ["26-30", 75.8],
    ["31-35", 76.2],
    ["36-40", 77.9],
    ["41-50", 74.5],
    ["50+", 73.7],
  ],
};

const genderStats = [
  { label: "Male", wellness: 72.6, productivity: 76.3, color: "#3ab0ff" },
  { label: "Female", wellness: 71.1, productivity: 75.1, color: "#ff68ba" },
  { label: "Other", wellness: 72.4, productivity: 76.0, color: "#9fe14a" },
];

const heatmapColumns = [
  "Engine",
  "Market",
  "Finance",
  "HR",
  "Operat",
  "Produc",
];
const heatmapRows = [
  { city: "Delhi", values: [74, 71, 75, 79, 74, 75] },
  { city: "Mumbai", values: [73, 71, 71, 74, 72, 68] },
  { city: "Bengaluru", values: [72, 71, 73, 70, 76, 74] },
  { city: "Hyderabad", values: [74, 67, 75, 70, 72, 71] },
];

function getThemeTokens(theme) {
  const isDark = theme.palette.mode === "dark";

  return {
    panelBg: alpha(theme.palette.background.paper, isDark ? 0.9 : 0.82),
    sectionBg: alpha(theme.palette.background.paper, isDark ? 0.8 : 0.66),
    navBg: alpha(theme.palette.background.default, isDark ? 0.72 : 0.5),
    cardBg: alpha(theme.palette.background.paper, isDark ? 0.72 : 0.78),
    strongText: theme.palette.text.primary,
    mutedText: alpha(theme.palette.text.secondary, isDark ? 0.9 : 0.95),
    softText: alpha(theme.palette.text.secondary, isDark ? 0.68 : 0.82),
    divider: alpha(theme.palette.divider, isDark ? 1 : 1.3),
    panelBorder: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12),
    activePillBg: theme.palette.primary.main,
    activePillText: theme.palette.primary.contrastText,
    inactivePillText: alpha(theme.palette.text.secondary, isDark ? 0.8 : 0.9),
    shadow: isDark
      ? "0 30px 60px rgba(0,0,0,0.32)"
      : "0 24px 48px rgba(15, 23, 42, 0.08)",
    heatBase: isDark ? "45, 212, 191" : "15, 118, 110",
  };
}

function Panel({ children, sx }) {
  const theme = useTheme();
  const tokens = getThemeTokens(theme);

  return (
    <Box
      sx={{
        bgcolor: tokens.panelBg,
        border: `1px solid ${tokens.panelBorder}`,
        borderRadius: 4,
        boxShadow: tokens.shadow,
        backdropFilter: "blur(10px)",
        overflow: "hidden",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function NavPill({ label, active }) {
  const theme = useTheme();
  const tokens = getThemeTokens(theme);

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        borderRadius: 2.5,
        bgcolor: active ? tokens.activePillBg : tokens.navBg,
        color: active ? tokens.activePillText : tokens.inactivePillText,
        border: active
          ? `1px solid ${alpha(theme.palette.primary.main, 0.38)}`
          : `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {label}
    </Box>
  );
}

function MetricCard({ item }) {
  const theme = useTheme();
  const tokens = getThemeTokens(theme);

  return (
    <Box
      sx={{
        minHeight: 118,
        p: 2.25,
        borderRadius: 2.5,
        bgcolor: tokens.cardBg,
        border: `1px solid ${item.color}33`,
      }}
    >
      <Stack spacing={1}>
        <Box
          sx={{
            color: item.color,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          {item.icon}
          <Typography sx={{ fontSize: 11, color: tokens.mutedText }}>
            {item.label}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 15, color: item.color, fontWeight: 800 }}>
          {item.value}
        </Typography>
        <Typography sx={{ fontSize: 11, color: tokens.softText }}>
          {item.subtext}
        </Typography>
      </Stack>
    </Box>
  );
}

function ChallengeCard({ card }) {
  const theme = useTheme();
  const tokens = getThemeTokens(theme);

  return (
    <Box
      sx={{
        minHeight: 150,
        p: 2.5,
        borderRadius: 2.5,
        bgcolor: tokens.cardBg,
        border: `1px solid ${card.accent}33`,
      }}
    >
      <Stack spacing={1.75}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box sx={{ lineHeight: 0 }}>{card.icon}</Box>
          <Box>
            <Typography
              sx={{ color: tokens.strongText, fontWeight: 700, fontSize: 16 }}
            >
              {card.title}
            </Typography>
            <Typography sx={{ color: tokens.mutedText, fontSize: 11 }}>
              {card.subtitle}
            </Typography>
          </Box>
        </Stack>
        <Typography sx={{ color: tokens.softText, fontSize: 12 }}>
          {card.description}
        </Typography>

        {card.action && (
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
          >
            <Box
              sx={{
                px: 1.5,
                py: 0.9,
                borderRadius: 1.6,
                border: `1px solid ${card.accent}`,
                color: card.accent,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {card.action}
            </Box>
            {card.meta && (
              <Typography
                sx={{ color: card.accent, fontWeight: 800, fontSize: 14 }}
              >
                {card.meta}
              </Typography>
            )}
          </Stack>
        )}

        {card.pills && (
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {card.pills.map((pill) => (
              <Box
                key={pill}
                sx={{
                  px: 1.5,
                  py: 0.85,
                  borderRadius: 1.6,
                  border: `1px solid ${card.accent}`,
                  color: card.accent,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {pill}
              </Box>
            ))}
          </Stack>
        )}

        {card.moods && (
          <Stack direction="row" spacing={2} sx={{ color: "#ffc83d", pt: 0.5 }}>
            {card.moods.map((mood, index) => (
              <Box key={index}>{mood}</Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

function BadgeCard({ badge }) {
  const theme = useTheme();
  const tokens = getThemeTokens(theme);

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 2.2,
        minHeight: 92,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: badge.active
          ? alpha(badge.color, 0.14)
          : alpha(theme.palette.background.default, 0.16),
        border: `1px solid ${
          badge.active
            ? alpha(badge.color, 0.4)
            : alpha(theme.palette.divider, 0.5)
        }`,
        opacity: badge.active ? 1 : 0.28,
      }}
    >
      <Typography sx={{ color: badge.color, fontSize: 24, lineHeight: 1 }}>
        ⬟
      </Typography>
      <Box>
        <Typography
          sx={{ color: tokens.strongText, fontWeight: 700, fontSize: 12 }}
        >
          {badge.name}
        </Typography>
        <Typography sx={{ color: tokens.softText, fontSize: 11 }}>
          {badge.tier}
        </Typography>
      </Box>
    </Box>
  );
}

function SectionTitle({ title, subtitle }) {
  const theme = useTheme();
  const tokens = getThemeTokens(theme);

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 1.75 }}
    >
      <Box>
        <Typography
          sx={{ color: tokens.strongText, fontWeight: 700, fontSize: 16 }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography sx={{ color: tokens.softText, fontSize: 11, mt: 0.4 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}

function FilterChip({ label }) {
  const theme = useTheme();
  const tokens = getThemeTokens(theme);

  return (
    <Box
      sx={{
        minWidth: 88,
        px: 1.6,
        py: 1.1,
        borderRadius: 1.6,
        bgcolor: alpha(theme.palette.background.default, 0.24),
        border: `1px solid ${tokens.panelBorder}`,
        color: tokens.strongText,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
    </Box>
  );
}

function MiniStat({ item }) {
  const theme = useTheme();
  const tokens = getThemeTokens(theme);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.2,
        bgcolor: tokens.cardBg,
        border: `1px solid ${item.color}33`,
        height: "100%",
      }}
    >
      <Stack spacing={0.9}>
        <Box
          sx={{
            color: item.color,
            display: "flex",
            alignItems: "center",
            gap: 0.8,
          }}
        >
          {item.icon}
          <Typography sx={{ color: tokens.mutedText, fontSize: 10.5 }}>
            {item.label}
          </Typography>
        </Box>
        <Typography sx={{ color: item.color, fontWeight: 800, fontSize: 16 }}>
          {item.value}
        </Typography>
        <Typography sx={{ color: tokens.softText, fontSize: 10.5 }}>
          {item.note}
        </Typography>
      </Stack>
    </Box>
  );
}

function SegmentedBars({ title, color, tabs, sections }) {
  const theme = useTheme();
  const tokens = getThemeTokens(theme);

  return (
    <Box
      sx={{
        p: 2.2,
        borderRadius: 2.5,
        bgcolor: tokens.sectionBg,
        border: `1px solid ${tokens.panelBorder}`,
        height: "100%",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1.8 }}
      >
        <Typography
          sx={{ color: tokens.strongText, fontWeight: 700, fontSize: 14.5 }}
        >
          {title}
        </Typography>
        <Stack direction="row" spacing={0.8}>
          {tabs.map((tab, index) => (
            <Box
              key={tab}
              sx={{
                px: 1.2,
                py: 0.6,
                borderRadius: 1.2,
                bgcolor:
                  index === 0
                    ? alpha(color, 0.22)
                    : alpha(theme.palette.background.default, 0.18),
                color: index === 0 ? tokens.strongText : tokens.softText,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {tab}
            </Box>
          ))}
        </Stack>
      </Stack>

      <Stack spacing={1.8}>
        {Object.entries(sections).map(([label, values]) => (
          <Box key={label}>
            <Typography
              sx={{ color: tokens.softText, fontSize: 10.5, mb: 0.75 }}
            >
              {label}
            </Typography>
            <Grid container spacing={1}>
              {values.map(([name, score]) => (
                <Grid key={name} size={{ xs: 6, sm: 4, md: 2 }}>
                  <Box>
                    <Typography
                      sx={{
                        color,
                        fontSize: 10,
                        fontWeight: 700,
                        textAlign: "center",
                        mb: 0.4,
                      }}
                    >
                      {score}
                    </Typography>
                    <Box
                      sx={{
                        height: 48,
                        borderRadius: 0.8,
                        bgcolor: color,
                        opacity: 0.72,
                      }}
                    />
                    <Typography
                      sx={{
                        color: tokens.softText,
                        fontSize: 9,
                        textAlign: "center",
                        mt: 0.5,
                      }}
                    >
                      {name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function GenderBarRow({ item }) {
  const theme = useTheme();
  const tokens = getThemeTokens(theme);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
        <Typography sx={{ color: item.color, fontWeight: 700, fontSize: 12 }}>
          {item.label}
        </Typography>
        <Typography sx={{ color: tokens.softText, fontSize: 11 }}>
          Wellness{" "}
          <Box component="span" sx={{ color: item.color, fontWeight: 700 }}>
            {item.wellness}
          </Box>
          {" | "}Productivity{" "}
          <Box component="span" sx={{ color: item.color, fontWeight: 700 }}>
            {item.productivity}%
          </Box>
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={item.productivity}
        sx={{
          height: 6,
          borderRadius: 999,
          bgcolor: alpha(theme.palette.divider, 0.3),
          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
            bgcolor: item.color,
          },
        }}
      />
    </Box>
  );
}

function HeatCell({ value }) {
  const theme = useTheme();
  const tokens = getThemeTokens(theme);

  return (
    <Box
      sx={{
        py: 0.7,
        borderRadius: 1,
        textAlign: "center",
        bgcolor: `rgba(${tokens.heatBase}, ${0.2 + ((value - 65) / 20) * 0.38})`,
        color: tokens.strongText,
        fontWeight: 700,
        fontSize: 11,
      }}
    >
      {value}
    </Box>
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const tokens = getThemeTokens(theme);

  return (
    <Layout role="admin" title="Admin Dashboard">
      <Box
        sx={{
          color: tokens.strongText,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Grid container spacing={3}>
          {/* <Grid size={{ xs: 12, xl: 6 }}>
            <Panel sx={{ p: 2.2 }}>
              <Stack spacing={2.2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Stack spacing={0.25}>
                    <Typography
                      sx={{
                        color: "primary.main",
                        fontSize: 28,
                        fontWeight: 900,
                        lineHeight: 1,
                      }}
                    >
                      GOOGLE DASHBOARD
                    </Typography>
                    <Typography
                      sx={{
                        color: tokens.softText,
                        fontSize: 10,
                        letterSpacing: 0.8,
                      }}
                    >
                      WELLNESS INTELLIGENCE PLATFORM
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      p: 0.7,
                      borderRadius: 2.5,
                      bgcolor: tokens.navBg,
                    }}
                  >
                    {topNav.map((label, index) => (
                      <NavPill key={label} label={label} active={index === 1} />
                    ))}
                  </Stack>

                  <Typography sx={{ color: tokens.softText, fontSize: 11 }}>
                    Sun, 8 Mar, 26
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    color: tokens.mutedText,
                    fontSize: 12,
                    borderTop: `1px solid ${tokens.divider}`,
                    pt: 1.6,
                  }}
                >
                  Daily Challenges - 1 to 3 taps to complete • Earn XP • Build
                  Streaks • Unlock Badges
                </Box>

                <Grid container spacing={1.6}>
                  {challengeStats.map((item) => (
                    <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                      <MetricCard item={item} />
                    </Grid>
                  ))}
                </Grid>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 1,
                    alignItems: "center",
                    color: tokens.mutedText,
                    fontSize: 11,
                    borderTop: `1px solid ${tokens.divider}`,
                    borderBottom: `1px solid ${tokens.divider}`,
                    py: 1.2,
                  }}
                >
                  <Typography sx={{ fontSize: 11 }}>
                    Today&apos;s completion
                  </Typography>
                  <Typography sx={{ fontSize: 11 }}>
                    0/6 challenges • 0 XP earned today
                  </Typography>
                </Box>

                <SectionTitle
                  title="Today's Challenges"
                  subtitle="1 to 3 taps each. Simple as that."
                />

                <Grid container spacing={1.6}>
                  {challengeCards.map((card) => (
                    <Grid key={card.title} size={{ xs: 12, md: 6 }}>
                      <ChallengeCard card={card} />
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={1.6}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        p: 2.2,
                        borderRadius: 2.5,
                        bgcolor: tokens.sectionBg,
                        border: `1px solid ${tokens.panelBorder}`,
                        height: "100%",
                      }}
                    >
                      <SectionTitle title="My Badges" />
                      <Grid container spacing={1.2}>
                        {badges.map((badge) => (
                          <Grid key={badge.name} size={{ xs: 6, sm: 4 }}>
                            <BadgeCard badge={badge} />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        p: 2.2,
                        borderRadius: 2.5,
                        bgcolor: tokens.sectionBg,
                        border: `1px solid ${tokens.panelBorder}`,
                        height: "100%",
                      }}
                    >
                      <SectionTitle title="Weekly Leaderboard" />
                      <Stack spacing={1.25}>
                        {leaderboard.map((entry) => (
                          <Stack
                            key={entry.rank}
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                              py: 0.9,
                              borderBottom: `1px solid ${tokens.divider}`,
                              color: entry.highlight
                                ? theme.palette.primary.main
                                : tokens.strongText,
                            }}
                          >
                            <Box>
                              <Typography
                                sx={{ fontWeight: 700, fontSize: 12.5 }}
                              >
                                {entry.rank}
                              </Typography>
                              <Typography
                                sx={{ fontWeight: 700, fontSize: 13.5 }}
                              >
                                {entry.name}
                              </Typography>
                              <Typography
                                sx={{ color: tokens.softText, fontSize: 11 }}
                              >
                                {entry.meta}
                              </Typography>
                            </Box>
                            <Typography
                              sx={{ color: "#f7b84f", fontWeight: 800 }}
                            >
                              {entry.gain}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </Panel>
          </Grid> */}

          <Grid size={{ xs: 12, xl: 12 }}>
            <Panel sx={{ p: 2.2 }}>
              <Stack spacing={2.2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Stack spacing={0.25}>
                    <Typography
                      sx={{
                        color: "primary.main",
                        fontSize: 28,
                        fontWeight: 900,
                        lineHeight: 1,
                      }}
                    >
                      GOOGLE DASHBOARD
                    </Typography>
                    <Typography
                      sx={{
                        color: tokens.softText,
                        fontSize: 10,
                        letterSpacing: 0.8,
                      }}
                    >
                      WELLNESS INTELLIGENCE PLATFORM
                    </Typography>
                  </Stack>

                  {/* <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      p: 0.7,
                      borderRadius: 2.5,
                      bgcolor: tokens.navBg,
                    }}
                  >
                    {topNav.map((label, index) => (
                      <NavPill key={label} label={label} active={index === 2} />
                    ))}
                  </Stack> */}

                  <Typography sx={{ color: tokens.softText, fontSize: 11 }}>
                    Sun, 8 Mar, 26
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    color: tokens.mutedText,
                    fontSize: 12,
                    borderTop: `1px solid ${tokens.divider}`,
                    pt: 1.6,
                  }}
                >
                  HR Intelligence Centre - Population Health Analytics • CXO
                  Metrics • Location & Department Insights
                </Box>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Stack
                    direction="row"
                    spacing={1.2}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    {analyticsFilters.map((label) => (
                      <FilterChip key={label} label={`${label}  ▾`} />
                    ))}
                  </Stack>
                  <Typography
                    sx={{
                      color: "primary.main",
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    240{" "}
                    <Box
                      component="span"
                      sx={{ color: tokens.softText, fontWeight: 500 }}
                    >
                      employees selected
                    </Box>
                  </Typography>
                </Stack>

                <Grid container spacing={1.4}>
                  {analyticsStats.map((item) => (
                    <Grid
                      key={item.label}
                      size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
                    >
                      <MiniStat item={item} />
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={1.6}>
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <SegmentedBars
                      title="Wellness by Dimension"
                      color="#79b642"
                      tabs={["WellnessIndex", "Sleep", "Stress", "Nutrition"]}
                      sections={dimensionBlocks}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, lg: 6 }}>
                    <SegmentedBars
                      title="CXO Performance Metrics"
                      color="#5b93c4"
                      tabs={["Productivity", "Engagement", "Absenteeism"]}
                      sections={performanceBlocks}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={1.6}>
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <Box
                      sx={{
                        p: 2.2,
                        borderRadius: 2.5,
                        bgcolor: tokens.sectionBg,
                        border: `1px solid ${tokens.panelBorder}`,
                        height: "100%",
                      }}
                    >
                      <SectionTitle title="Gender-wise Wellness & Productivity" />
                      <Stack spacing={2.2}>
                        {genderStats.map((item) => (
                          <GenderBarRow key={item.label} item={item} />
                        ))}
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, lg: 6 }}>
                    <Box
                      sx={{
                        p: 2.2,
                        borderRadius: 2.5,
                        bgcolor: tokens.sectionBg,
                        border: `1px solid ${tokens.panelBorder}`,
                        height: "100%",
                      }}
                    >
                      <SectionTitle
                        title="Wellness ↔ Productivity Correlation"
                        subtitle="each bubble = dept × age • size = headcount"
                      />
                      <Box
                        sx={{
                          position: "relative",
                          height: 170,
                          mt: 1,
                          borderLeft: `1px solid ${tokens.divider}`,
                          borderBottom: `1px solid ${tokens.divider}`,
                          ml: 2,
                          mr: 3,
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            left: "58%",
                            top: "36%",
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "rgba(255, 183, 77, 0.9)",
                            border: "4px solid rgba(255, 106, 106, 0.28)",
                            boxShadow: "0 0 20px rgba(255, 183, 77, 0.25)",
                          }}
                        >
                          <Typography
                            sx={{
                              color: tokens.strongText,
                              fontSize: 8,
                              fontWeight: 800,
                            }}
                          >
                            HR
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            position: "absolute",
                            bottom: -18,
                            left: "44%",
                            color: tokens.softText,
                            fontSize: 9,
                          }}
                        >
                          Wellness Index →
                        </Typography>
                        <Typography
                          sx={{
                            position: "absolute",
                            top: "44%",
                            left: -56,
                            color: tokens.softText,
                            fontSize: 9,
                            transform: "rotate(-90deg)",
                          }}
                        >
                          Productivity →
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    p: 2.2,
                    borderRadius: 2.5,
                    bgcolor: tokens.sectionBg,
                    border: `1px solid ${tokens.panelBorder}`,
                  }}
                >
                  <SectionTitle title="Location × Department Wellness Heatmap" />
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "92px repeat(6, 1fr)",
                        md: "140px repeat(6, 1fr)",
                      },
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ color: tokens.softText, fontSize: 11 }}>
                      Location / Dept
                    </Typography>
                    {heatmapColumns.map((column) => (
                      <Typography
                        key={column}
                        sx={{
                          color: tokens.softText,
                          fontSize: 10.5,
                          textAlign: "center",
                        }}
                      >
                        {column}
                      </Typography>
                    ))}

                    {heatmapRows.map((row) => (
                      <Box key={row.city} sx={{ display: "contents" }}>
                        <Typography
                          sx={{ color: tokens.strongText, fontSize: 12 }}
                        >
                          {row.city}
                        </Typography>
                        {row.values.map((value, index) => (
                          <HeatCell
                            key={`${row.city}-${index}`}
                            value={value}
                          />
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Stack>
            </Panel>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}
