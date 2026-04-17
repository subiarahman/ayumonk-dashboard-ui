import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/commonLayout/Layout";
import { getRaisedGradient, getSurfaceBackground } from "../../theme";

const heroStats = [
  {
    label: "Company Data",
    value: "Tenant Setup",
    note: "Manage company records",
    color: "#0f766e",
    icon: <BusinessRoundedIcon fontSize="small" />,
  },
  {
    label: "Suggestion Master",
    value: "Content Rules",
    note: "Maintain suggestion library",
    color: "#1d4ed8",
    icon: <TipsAndUpdatesRoundedIcon fontSize="small" />,
  },
  {
    label: "KPI Suggestion Mapping",
    value: "Decision Links",
    note: "Connect KPI, question, suggestion",
    color: "#c2410c",
    icon: <LinkRoundedIcon fontSize="small" />,
  },
];

const workspaceCards = [
  {
    title: "Company Data",
    metric: "Organization setup",
    detail:
      "Create, review, and maintain company records for super admin operations.",
    accent: "#1d4ed8",
    to: "/super-admin/company-data",
  },
  {
    title: "Suggestion Master",
    metric: "Suggestion catalog",
    detail:
      "Manage suggestion records, content metadata, and activation status in one place.",
    accent: "#0f766e",
    to: "/super-admin/suggestion-master",
  },
  {
    title: "KPI Suggestion Mapping",
    metric: "Trigger configuration",
    detail:
      "Map KPI and question conditions to suggestion outcomes with priority rules.",
    accent: "#b45309",
    to: "/super-admin/kpi-suggestion-mapping",
  },
];

const managementNotes = [
  {
    title: "Content Operations",
    detail:
      "Suggestion content and mapping logic now live under dedicated super admin modules.",
  },
  {
    title: "Configuration Flow",
    detail:
      "Company setup, suggestion management, and KPI mapping are the core daily actions from this workspace.",
  },
  {
    title: "Admin Experience",
    detail:
      "Use this dashboard as the landing page for quick navigation into the active super admin tools.",
  },
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

function StatCard({ item }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(item.color, 0.2),
        background: getRaisedGradient(theme, item.color),
        height: "100%",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Avatar
          sx={{
            bgcolor: alpha(item.color, 0.14),
            color: item.color,
            width: 42,
            height: 42,
          }}
        >
          {item.icon}
        </Avatar>
        <Chip
          label={item.note}
          size="small"
          sx={{
            bgcolor: alpha(item.color, 0.1),
            color: item.color,
            fontWeight: 700,
          }}
        />
      </Stack>

      <Typography color="text.secondary" sx={{ mt: 1.5 }}>
        {item.label}
      </Typography>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, mt: 0.4, color: item.color }}
      >
        {item.value}
      </Typography>
    </Paper>
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Layout role="superadmin" title="Super Admin Dashboard">
      <Stack spacing={2.5}>
        <SectionCard
          sx={{
            overflow: "hidden",
            position: "relative",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.1)} 0%, ${getSurfaceBackground(theme, theme.palette.mode === "dark" ? 0.98 : 0.94)} 55%, ${alpha("#f59e0b", theme.palette.mode === "dark" ? 0.14 : 0.08)} 100%)`,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: -30,
              top: -28,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.1)}, transparent 70%)`,
            }}
          />

          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ position: "relative" }}
          >
            <Box sx={{ maxWidth: 820 }}>
              <Typography
                variant="overline"
                sx={{ color: "primary.main", fontWeight: 700 }}
              >
                Super Admin Workspace
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                Super Admin Control Center
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Central workspace for company setup, suggestion management, and
                KPI suggestion mapping.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "row", sm: "row" }}
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                label="Company Data"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="Suggestions"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="Mappings"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </Stack>
        </SectionCard>

        <Grid container spacing={2}>
          {heroStats.map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard item={item} />
            </Grid>
          ))}
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
                Super Admin Workspace
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quick access to the main super admin modules
              </Typography>
            </Box>
            <Chip
              label="Core Navigation"
              icon={<StarsRoundedIcon />}
              color="primary"
              variant="outlined"
            />
          </Stack>

          <Grid container spacing={2}>
            {workspaceCards.map((item) => (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderTop: `4px solid ${item.accent}`,
                    height: "100%",
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: item.accent }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ mt: 0.8, fontWeight: 700 }}>
                    {item.metric}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {item.detail}
                  </Typography>
                  <Button
                    variant="text"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={() => navigate(item.to)}
                    sx={{ mt: 1.5, px: 0 }}
                  >
                    Open Module
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        <SectionCard>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Current Focus
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Updated dashboard notes aligned with the current super admin setup.
              </Typography>
            </Box>

            {managementNotes.map((item) => (
              <Paper
                key={item.title}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2.5 }}
              >
                <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {item.detail}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      </Stack>
    </Layout>
  );
}
