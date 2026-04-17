import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";
import BedtimeRoundedIcon from "@mui/icons-material/BedtimeRounded";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import Layout from "../../layouts/commonLayout/Layout";
import {
  clearMySubmissionsState,
  clearMyLinksState,
  fetchMyLinks,
  fetchMySubmissions,
} from "../../store/sessionSlice";
import { getSurfaceBackground, getRaisedGradient } from "../../theme";
import { formatDateIST, formatDateTimeIST } from "../../utils/dateTime";

function getDaysSince(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
}

function getScoreTone(score, theme) {
  if (score >= 4) {
    return {
      label: "Strong",
      color: theme.palette.success.main,
      bg: alpha(theme.palette.success.main, 0.14),
    };
  }
  if (score >= 3) {
    return {
      label: "Balanced",
      color: theme.palette.warning.main,
      bg: alpha(theme.palette.warning.main, 0.14),
    };
  }
  if (score >= 2) {
    return {
      label: "Needs Attention",
      color: theme.palette.error.main,
      bg: alpha(theme.palette.error.main, 0.14),
    };
  }
  return {
    label: "Critical",
    color: theme.palette.error.dark,
    bg: alpha(theme.palette.error.main, 0.2),
  };
}

function getKpiIcon(index) {
  const icons = [
    <InsightsRoundedIcon key="i" fontSize="inherit" />,
    <LocalFireDepartmentRoundedIcon key="f" fontSize="inherit" />,
    <WaterDropRoundedIcon key="w" fontSize="inherit" />,
    <SelfImprovementRoundedIcon key="s" fontSize="inherit" />,
    <BedtimeRoundedIcon key="b" fontSize="inherit" />,
    <DirectionsRunRoundedIcon key="d" fontSize="inherit" />,
    <RestaurantRoundedIcon key="r" fontSize="inherit" />,
  ];
  return icons[index % icons.length];
}

function ScoreBar({ score, color }) {
  const pct = Math.max(0, Math.min(100, ((score - 1) / 4) * 100));

  return (
    <Box
      sx={{
        flex: 1,
        height: 6,
        borderRadius: 999,
        bgcolor: alpha("#fff", 0.08),
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${alpha(color, 0.95)}, ${color})`,
        }}
      />
    </Box>
  );
}

function SummaryCard({ label, value, sublabel, icon, accent, tone }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: 3,
        height: "100%",
        border: `1px solid ${alpha(accent, 0.22)}`,
        bgcolor: "transparent",
        backgroundImage: `linear-gradient(135deg, ${alpha(accent, 0.16)} 0%, ${alpha(accent, 0.04)} 42%, transparent 100%)`,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(accent, 0.14),
            color: accent,
            border: `1px solid ${alpha(accent, 0.2)}`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 850,
              lineHeight: 1.05,
              mt: 0.5,
              color: tone || "text.primary",
            }}
          >
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {sublabel}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function MyResponses() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("submitted");
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [expandedKpiKey, setExpandedKpiKey] = useState(null);
  const {
    mySubmissions,
    mySubmissionsLoading,
    mySubmissionsError,
    mySubmissionsMessage,
    myLinks,
    myLinksLoading,
    myLinksError,
  } = useSelector((state) => state.session);

  useEffect(() => {
    dispatch(fetchMySubmissions());
    dispatch(fetchMyLinks({ skip: 0, limit: 50 }));

    return () => {
      dispatch(clearMySubmissionsState());
      dispatch(clearMyLinksState());
    };
  }, [dispatch]);

  const unansweredLinks = useMemo(() => {
    const submittedIds = new Set(
      mySubmissions
        .filter((session) => (session.responses || []).length)
        .map((session) => session.session_id),
    );
    return myLinks.filter((item) => !submittedIds.has(item.session_id));
  }, [myLinks, mySubmissions]);

  const summary = useMemo(() => {
    const responses = mySubmissions.flatMap(
      (session) => session.responses || [],
    );
const averageScore = responses.length
  ? Number(
      (
        responses.reduce(
          (total, item) => total + (item.weighted_index || 0),
          0,
        ) / responses.length
      ).toFixed(2)
    )
  : 0;
    const overdueForms = unansweredLinks.filter((item) => {
      const daysOpen = getDaysSince(item.published_at);
      return daysOpen !== null && daysOpen >= 7;
    });

    return {
      submittedForms: mySubmissions.length,
      pendingForms: unansweredLinks.length,
      overdueForms: overdueForms.length,
      averageScore,
    };
  }, [mySubmissions, unansweredLinks]);

  const visibleTab =
    !mySubmissions.length && unansweredLinks.length ? "pending" : activeTab;
  const selectedSession = useMemo(
    () =>
      mySubmissions.find(
        (session) => session.session_id === selectedSessionId,
      ) || null,
    [mySubmissions, selectedSessionId],
  );
  const selectedResponse = selectedSession?.responses?.[0] || null;
  const selectedScore = selectedResponse?.weighted_index ?? 0;
  const selectedTone = getScoreTone(selectedScore, theme);
  const selectedScorePct = Math.max(
    0,
    Math.min(100, (selectedScore / 5) * 100),
  );
  const selectedBreakdown = selectedResponse?.kpi_scores || [];

  return (
    <Layout role="user" title="My Responses">
      <Stack spacing={2.5}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.25, sm: 3 },
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            bgcolor: getSurfaceBackground(theme),
            backgroundImage: getRaisedGradient(
              theme,
              theme.palette.primary.main,
            ),
          }}
        >
          <Stack spacing={1.25}>
            <Chip
              label="MY RESPONSES"
              icon={<AssignmentTurnedInRoundedIcon fontSize="inherit" />}
              size="small"
              sx={{
                width: "fit-content",
                fontWeight: 800,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 850 }}>
              My Responses
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 900 }}>
              Review your submitted session responses, see KPI score breakdowns,
              and keep an eye on forms that still need your attention.
            </Typography>
          </Stack>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                label="Forms Submitted"
                value={summary.submittedForms}
                sublabel="Total completed sessions"
                icon={<AssignmentTurnedInRoundedIcon fontSize="small" />}
                accent={theme.palette.success.main}
                tone={theme.palette.success.main}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                label="Pending"
                value={summary.pendingForms}
                sublabel="Awaiting your response"
                icon={<HourglassBottomRoundedIcon fontSize="small" />}
                accent={theme.palette.warning.main}
                tone={theme.palette.warning.main}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                label="Overdue"
                value={summary.overdueForms}
                sublabel="Published 7+ days ago"
                icon={<WarningAmberRoundedIcon fontSize="small" />}
                accent={theme.palette.error.main}
                tone={theme.palette.error.main}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                label="Avg Score"
                value={summary.averageScore}
                sublabel="Across submitted responses"
                icon={<QueryStatsRoundedIcon fontSize="small" />}
                accent={theme.palette.primary.main}
                tone={theme.palette.primary.main}
              />
            </Grid>
          </Grid>
        </Paper>

        {mySubmissionsError && (
          <Alert severity="error">{mySubmissionsError}</Alert>
        )}
        {myLinksError && <Alert severity="error">{myLinksError}</Alert>}
        {!mySubmissionsError && mySubmissionsMessage && (
          <Alert severity="success">{mySubmissionsMessage}</Alert>
        )}

        {mySubmissionsLoading ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: getSurfaceBackground(theme),
            }}
          >
            <Typography>Loading your submitted responses...</Typography>
          </Paper>
        ) : null}

        {myLinksLoading ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: getSurfaceBackground(theme),
            }}
          >
            <Typography>Loading your pending session forms...</Typography>
          </Paper>
        ) : null}

        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            flexWrap: "wrap",
            bgcolor: alpha(theme.palette.common.black, 0.24),
            borderRadius: 2.5,
            p: 0.5,
            width: "fit-content",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          {[
            {
              id: "submitted",
              label: "Submitted",
              count: summary.submittedForms,
              icon: <CheckCircleRoundedIcon fontSize="inherit" />,
            },
            {
              id: "pending",
              label: "Pending",
              count: summary.pendingForms,
              icon: <HourglassBottomRoundedIcon fontSize="inherit" />,
            },
          ].map((tab) => {
            const isActive = visibleTab === tab.id;
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                startIcon={tab.icon}
                sx={{
                  minWidth: 150,
                  justifyContent: "flex-start",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontWeight: 800,
                  color: isActive ? "common.white" : "text.secondary",
                  backgroundImage: isActive
                    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`
                    : "none",
                  boxShadow: isActive
                    ? `0 10px 24px ${alpha(theme.palette.primary.main, 0.24)}`
                    : "none",
                  "&:hover": {
                    bgcolor: isActive
                      ? theme.palette.primary.dark
                      : alpha(theme.palette.common.white, 0.05),
                  },
                }}
              >
                <Box component="span" sx={{ mr: 1 }}>
                  {tab.label}
                </Box>
                <Box
                  component="span"
                  sx={{
                    ml: "auto",
                    minWidth: 22,
                    height: 22,
                    px: 0.75,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "999px",
                    bgcolor: isActive
                      ? alpha(theme.palette.common.white, 0.22)
                      : alpha(theme.palette.common.white, 0.08),
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {tab.count}
                </Box>
              </Button>
            );
          })}
        </Box>

        {visibleTab === "submitted" &&
        !mySubmissionsLoading &&
        !mySubmissions.length ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: getSurfaceBackground(theme),
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No submissions found
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Once you submit session forms, they will appear here.
            </Typography>
          </Paper>
        ) : null}

        {selectedSessionId === "__hidden__" &&
          visibleTab === "submitted" &&
          selectedSession && (
            <Stack spacing={2.5}>
              <Button
                onClick={() => {
                  setSelectedSessionId(null);
                  setExpandedKpiKey(null);
                }}
                variant="text"
                sx={{
                  width: "fit-content",
                  px: 0,
                  color: theme.palette.text.secondary,
                  fontWeight: 700,
                }}
              >
                Back to My Responses
              </Button>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  bgcolor: getSurfaceBackground(theme),
                }}
              >
                <Box
                  sx={{
                    p: { xs: 2.25, sm: 3 },
                    backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.success.main} 100%)`,
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="overline"
                        sx={{
                          letterSpacing: 1.2,
                          color: alpha("#fff", 0.7),
                        }}
                      >
                        {selectedSession.title}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 900,
                          color: "#fff",
                          lineHeight: 1.05,
                          mt: 0.5,
                        }}
                      >
                        Wellness Check-in
                      </Typography>
                      <Typography sx={{ color: alpha("#fff", 0.75), mt: 0.8 }}>
                        Submitted{" "}
                        {formatDateTimeIST(selectedResponse?.submitted_at)}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                      <Typography
                        sx={{ fontSize: 12, color: alpha("#fff", 0.75) }}
                      >
                        Wellness Index
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: 48, sm: 58 },
                          fontWeight: 900,
                          color: "#fff",
                          lineHeight: 1,
                        }}
                      >
                        {selectedScore}
                      </Typography>
                      <Typography sx={{ color: alpha("#fff", 0.85), mt: 0.6 }}>
                        {selectedTone.label}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ mt: 2.5 }}>
                    <Box
                      sx={{
                        height: 6,
                        borderRadius: 999,
                        bgcolor: alpha("#fff", 0.18),
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${Math.max(4, selectedScorePct)}%`,
                          borderRadius: 999,
                          bgcolor: alpha("#fff", 0.92),
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 0.6,
                        fontSize: 11,
                        color: alpha("#fff", 0.65),
                      }}
                    >
                      <span>0</span>
                      <span>40 Moderate</span>
                      <span>60 Good</span>
                      <span>80 Excellent</span>
                      <span>100</span>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ p: { xs: 2.25, sm: 3 } }}>
                  <Grid container spacing={1.5}>
                    {selectedBreakdown.map((item, index) => {
                      const isExpanded = expandedKpiKey === item.kpi_key;
                      const accent = [
                        theme.palette.info.main,
                        theme.palette.warning.main,
                        theme.palette.success.main,
                        theme.palette.primary.main,
                        theme.palette.secondary.main,
                      ][index % 5];
                      const average = Number(item.average_score || 0);

                      return (
                        <Grid
                          key={item.kpi_key}
                          size={{ xs: 12, md: 6, xl: 4 }}
                        >
                          <Paper
                            variant="outlined"
                            onClick={() =>
                              setExpandedKpiKey(
                                isExpanded ? null : item.kpi_key,
                              )
                            }
                            sx={{
                              p: 1.75,
                              borderRadius: 3,
                              height: "100%",
                              cursor: "pointer",
                              borderColor: isExpanded
                                ? alpha(accent, 0.45)
                                : alpha(theme.palette.primary.main, 0.12),
                              bgcolor: alpha(theme.palette.common.white, 0.02),
                            }}
                          >
                            <Stack spacing={1.25}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 2,
                                    display: "grid",
                                    placeItems: "center",
                                    color: accent,
                                    bgcolor: alpha(accent, 0.12),
                                  }}
                                >
                                  {getKpiIcon(index)}
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    spacing={1}
                                    alignItems="center"
                                  >
                                    <Typography sx={{ fontWeight: 850 }}>
                                      {item.kpi_name}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "baseline",
                                        gap: 0.5,
                                      }}
                                    >
                                      <Typography
                                        sx={{ fontWeight: 900, color: accent }}
                                      >
                                        {average.toFixed(2)}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        /5
                                      </Typography>
                                    </Box>
                                  </Stack>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={{ mt: 0.8 }}
                                  >
                                    <ScoreBar score={average} color={accent} />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {Math.round(((average - 1) / 4) * 100)}%
                                    </Typography>
                                  </Stack>
                                </Box>
                                <Typography
                                  sx={{
                                    color: alpha(
                                      theme.palette.text.secondary,
                                      0.8,
                                    ),
                                  }}
                                >
                                  {isExpanded ? "▲" : "▼"}
                                </Typography>
                              </Stack>

                              {isExpanded && (
                                <Box
                                  sx={{
                                    mt: 0.5,
                                    pt: 1.2,
                                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                                  }}
                                >
                                  <Stack spacing={0.75}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Total Score: {item.total_score}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Questions: {item.question_count}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Average Score: {average.toFixed(2)}
                                    </Typography>
                                  </Stack>
                                </Box>
                              )}
                            </Stack>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <Paper
                    sx={{
                      mt: 2.5,
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.16)}`,
                      bgcolor: alpha(theme.palette.success.main, 0.04),
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 850,
                        color: theme.palette.success.main,
                        mb: 1.5,
                      }}
                    >
                      Wellness Index Breakdown
                    </Typography>
                    <Stack spacing={1.1}>
                      {selectedBreakdown.map((item, index) => {
                        const accent = [
                          theme.palette.info.main,
                          theme.palette.warning.main,
                          theme.palette.success.main,
                          theme.palette.primary.main,
                          theme.palette.secondary.main,
                        ][index % 5];
                        const average = Number(item.average_score || 0);
                        const contribution =
                          (average / 5) * (item.total_score || 0);

                        return (
                          <Stack
                            key={`${item.kpi_key}-breakdown`}
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1.25}
                            alignItems={{ sm: "center" }}
                          >
                            <Box
                              sx={{
                                width: { xs: "100%", sm: 120 },
                                flexShrink: 0,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700 }}
                              >
                                {item.kpi_name}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <ScoreBar score={average} color={accent} />
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ minWidth: 90, textAlign: { sm: "center" } }}
                            >
                              {average.toFixed(2)} / 5
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                minWidth: 70,
                                textAlign: "right",
                                fontWeight: 800,
                                color: accent,
                              }}
                            >
                              +{contribution.toFixed(1)}
                            </Typography>
                          </Stack>
                        );
                      })}
                    </Stack>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "baseline",
                        gap: 1,
                        mt: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Wellness Index =
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 28,
                          fontWeight: 900,
                          color: theme.palette.success.main,
                        }}
                      >
                        {selectedScore}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        / 5
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Paper>
            </Stack>
          )}

        {visibleTab === "submitted" &&
          !mySubmissionsLoading &&
          mySubmissions.map((session) => {
            const latestResponse = session.responses?.[0];
            const latestScore = latestResponse?.weighted_index ?? 0;

            const scoreTone = getScoreTone(latestScore, theme);
            const progress = Math.max(
              4,
              Math.min(100, (latestScore / 5) * 100),
            );
            const isSelected = selectedSessionId === session.session_id;

            return (
              <Paper
                key={session.session_id}
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                  border: `1px solid ${isSelected ? alpha(theme.palette.primary.main, 0.32) : alpha(theme.palette.primary.main, 0.12)}`,
                  bgcolor: getSurfaceBackground(theme),
                  backgroundImage: isSelected
                    ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.06)} 100%)`
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 45%)`,
                  boxShadow: isSelected
                    ? `0 12px 28px ${alpha(theme.palette.primary.main, 0.14)}`
                    : "none",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedSessionId(isSelected ? null : session.session_id);
                  setExpandedKpiKey(null);
                }}
              >
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    spacing={1.5}
                    alignItems={{ md: "flex-start" }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Chip
                          label="SUBMITTED"
                          size="small"
                          icon={<CheckCircleRoundedIcon fontSize="inherit" />}
                          sx={{
                            width: "fit-content",
                            fontWeight: 800,
                            bgcolor: alpha(theme.palette.success.main, 0.14),
                            color: theme.palette.success.main,
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {session.responses.length} submission
                          {session.responses.length === 1 ? "" : "s"}
                          {latestResponse?.submitted_at
                            ? ` - Latest ${formatDateTimeIST(latestResponse.submitted_at)}`
                            : ""}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" sx={{ fontWeight: 850, mt: 1 }}>
                        {session.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        {session.description || "No description provided."}
                      </Typography>
                    </Box>

                    <Stack
                      alignItems={{ xs: "flex-start", md: "flex-end" }}
                      spacing={0.75}
                      sx={{ flexShrink: 0 }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: 40, sm: 48 },
                          lineHeight: 1,
                          fontWeight: 900,
                          color: scoreTone.color,
                        }}
                      >
                        {latestScore}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          px: 1.15,
                          py: 0.4,
                          borderRadius: 999,
                          bgcolor: scoreTone.bg,
                          color: scoreTone.color,
                          fontWeight: 700,
                        }}
                      >
                        {scoreTone.label}
                      </Typography>
                      <Button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedSessionId(
                            isSelected ? null : session.session_id,
                          );
                          setExpandedKpiKey(null);
                        }}
                        variant="text"
                        sx={{
                          minWidth: 0,
                          px: 0.75,
                          py: 0.25,
                          color: theme.palette.primary.main,
                          fontWeight: 800,
                        }}
                      >
                        {isSelected ? "Collapse" : "Expand"}
                      </Button>
                    </Stack>
                  </Stack>

                  {!!latestResponse?.kpi_scores?.length && (
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                      sx={{ rowGap: 1 }}
                    >
                      {latestResponse.kpi_scores.map((item, index) => (
                        <Chip
                          key={item.kpi_key}
                          icon={
                            <Box
                              component="span"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 15,
                                color: theme.palette.primary.main,
                              }}
                            >
                              {getKpiIcon(index)}
                            </Box>
                          }
                          label={`${item.kpi_name} ${Number(item.average_score || 0).toFixed(1)}`}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: "text.primary",
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                            fontWeight: 700,
                          }}
                        />
                      ))}
                    </Stack>
                  )}

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Response score
                    </Typography>
                    <Box sx={{ flex: 1, minWidth: 120 }}>
                      <Box
                        sx={{
                          height: 6,
                          borderRadius: 999,
                          bgcolor: alpha(theme.palette.text.primary, 0.08),
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            width: `${progress}%`,
                            borderRadius: 999,
                            background: `linear-gradient(90deg, ${theme.palette.success.main}, ${scoreTone.color})`,
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: scoreTone.color, fontWeight: 800 }}
                    >
                      {latestScore}
                    </Typography>
                  </Stack>

                  {isSelected && (
                    <Box
                      sx={{
                        mt: 1,
                        pt: 2,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          overflow: "hidden",
                          borderRadius: 3,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                          bgcolor: getSurfaceBackground(theme),
                        }}
                      >
                        <Box
                          sx={{
                            p: { xs: 2.25, sm: 3 },
                            backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.success.main} 100%)`,
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            spacing={2}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="overline"
                                sx={{
                                  letterSpacing: 1.2,
                                  color: alpha("#fff", 0.7),
                                }}
                              >
                                {session.title}
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{
                                  fontWeight: 900,
                                  color: "#fff",
                                  lineHeight: 1.05,
                                  mt: 0.5,
                                }}
                              >
                                Wellness Check-in
                              </Typography>
                              <Typography
                                sx={{ color: alpha("#fff", 0.75), mt: 0.8 }}
                              >
                                Submitted{" "}
                                {formatDateTimeIST(
                                  latestResponse?.submitted_at,
                                )}
                              </Typography>
                            </Box>
                            <Box
                              sx={{ textAlign: { xs: "left", md: "right" } }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  color: alpha("#fff", 0.75),
                                }}
                              >
                                Wellness Index
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: { xs: 48, sm: 58 },
                                  fontWeight: 900,
                                  color: "#fff",
                                  lineHeight: 1,
                                }}
                              >
                                {latestScore}
                              </Typography>
                              <Typography
                                sx={{ color: alpha("#fff", 0.85), mt: 0.6 }}
                              >
                                {scoreTone.label}
                              </Typography>
                            </Box>
                          </Stack>
                          <Box sx={{ mt: 2.5 }}>
                            <Box
                              sx={{
                                height: 6,
                                borderRadius: 999,
                                bgcolor: alpha("#fff", 0.18),
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                sx={{
                                  height: "100%",
                                  width: `${progress}%`,
                                  borderRadius: 999,
                                  bgcolor: alpha("#fff", 0.92),
                                }}
                              />
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 0.6,
                                fontSize: 11,
                                color: alpha("#fff", 0.65),
                              }}
                            >
                              <span>0</span>
                              <span>40 Moderate</span>
                              <span>60 Good</span>
                              <span>80 Excellent</span>
                              <span>100</span>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ p: { xs: 2.25, sm: 3 } }}>
                          <Grid container spacing={1.5}>
                            {latestResponse?.kpi_scores?.map((item, index) => {
                              const accent = [
                                theme.palette.info.main,
                                theme.palette.warning.main,
                                theme.palette.success.main,
                                theme.palette.primary.main,
                                theme.palette.secondary.main,
                              ][index % 5];
                              const average = Number(item.average_score || 0);
                              return (
                                <Grid
                                  key={item.kpi_key}
                                  size={{ xs: 12, md: 6, xl: 4 }}
                                >
                                  <Paper
                                    variant="outlined"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setExpandedKpiKey(
                                        expandedKpiKey === item.kpi_key
                                          ? null
                                          : item.kpi_key,
                                      );
                                    }}
                                    sx={{
                                      p: 1.6,
                                      borderRadius: 3,
                                      height: "100%",
                                      cursor: "pointer",
                                      borderColor:
                                        expandedKpiKey === item.kpi_key
                                          ? alpha(accent, 0.45)
                                          : alpha(
                                              theme.palette.primary.main,
                                              0.12,
                                            ),
                                      bgcolor: alpha(
                                        theme.palette.common.white,
                                        0.02,
                                      ),
                                    }}
                                  >
                                    <Stack spacing={1}>
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                      >
                                        <Box
                                          sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 2,
                                            display: "grid",
                                            placeItems: "center",
                                            color: accent,
                                            bgcolor: alpha(accent, 0.12),
                                          }}
                                        >
                                          {getKpiIcon(index)}
                                        </Box>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                          <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            spacing={1}
                                            alignItems="center"
                                          >
                                            <Typography
                                              sx={{ fontWeight: 850 }}
                                            >
                                              {item.kpi_name}
                                            </Typography>
                                            <Typography
                                              sx={{
                                                fontWeight: 900,
                                                color: accent,
                                              }}
                                            >
                                              {average.toFixed(2)}
                                            </Typography>
                                          </Stack>
                                          <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            sx={{ mt: 0.8 }}
                                          >
                                            <ScoreBar
                                              score={average}
                                              color={accent}
                                            />
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              {Math.round(
                                                ((average - 1) / 4) * 100,
                                              )}
                                              %
                                            </Typography>
                                          </Stack>
                                        </Box>
                                      </Stack>
                                      {expandedKpiKey === item.kpi_key && (
                                        <Stack
                                          spacing={0.6}
                                          sx={{
                                            pt: 1,
                                            borderTop: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                                          }}
                                        >
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            Total Score: {item.total_score}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            Questions: {item.question_count}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            Average Score: {average.toFixed(2)}
                                          </Typography>
                                        </Stack>
                                      )}
                                    </Stack>
                                  </Paper>
                                </Grid>
                              );
                            })}
                          </Grid>

                          <Paper
                            sx={{
                              mt: 2.5,
                              p: { xs: 2, sm: 2.5 },
                              borderRadius: 3,
                              border: `1px solid ${alpha(theme.palette.success.main, 0.16)}`,
                              bgcolor: alpha(theme.palette.success.main, 0.04),
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 850,
                                color: theme.palette.success.main,
                                mb: 1.5,
                              }}
                            >
                              Wellness Index Breakdown
                            </Typography>
                            <Stack spacing={1.1}>
                              {latestResponse?.kpi_scores?.map(
                                (item, index) => {
                                  const accent = [
                                    theme.palette.info.main,
                                    theme.palette.warning.main,
                                    theme.palette.success.main,
                                    theme.palette.primary.main,
                                    theme.palette.secondary.main,
                                  ][index % 5];
                                  const average = Number(
                                    item.average_score || 0,
                                  );
                                  const contribution =
                                    (average / 5) * (item.total_score || 0);
                                  return (
                                    <Stack
                                      key={`${item.kpi_key}-breakdown`}
                                      direction={{ xs: "column", sm: "row" }}
                                      spacing={1.25}
                                      alignItems={{ sm: "center" }}
                                    >
                                      <Box
                                        sx={{
                                          width: { xs: "100%", sm: 120 },
                                          flexShrink: 0,
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{ fontWeight: 700 }}
                                        >
                                          {item.kpi_name}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ flex: 1 }}>
                                        <ScoreBar
                                          score={average}
                                          color={accent}
                                        />
                                      </Box>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                          minWidth: 90,
                                          textAlign: { sm: "center" },
                                        }}
                                      >
                                        {average.toFixed(2)} / 5
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          minWidth: 70,
                                          textAlign: "right",
                                          fontWeight: 800,
                                          color: accent,
                                        }}
                                      >
                                        +{contribution.toFixed(1)}
                                      </Typography>
                                    </Stack>
                                  );
                                },
                              )}
                            </Stack>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "baseline",
                                gap: 1,
                                mt: 2,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Wellness Index =
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 28,
                                  fontWeight: 900,
                                  color: theme.palette.success.main,
                                }}
                              >
                                {latestScore}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                / 5
                              </Typography>
                            </Box>
                          </Paper>
                        </Box>
                      </Paper>
                    </Box>
                  )}

                  <Collapse in={false}>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                      {session.responses.map((response, responseIndex) => {
                        return (
                          <Paper
                            key={response.response_id}
                            variant="outlined"
                            sx={{ p: 2, borderRadius: 3 }}
                          >
                            <Stack spacing={2}>
                              <Stack
                                direction={{ xs: "column", md: "row" }}
                                justifyContent="space-between"
                                spacing={1.5}
                              >
                                <Box>
                                  <Typography sx={{ fontWeight: 700 }}>
                                    Submission {responseIndex + 1}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {response.employee_email || "-"}
                                  </Typography>
                                </Box>
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={1}
                                  useFlexGap
                                  flexWrap="wrap"
                                >
                                  <Chip
                                    label={`Submitted: ${formatDateTimeIST(response.submitted_at)}`}
                                    variant="outlined"
                                  />
                                  <Chip
                                    label={`Weighted Index: ${response.weighted_index ?? "-"}`}
                                    color="primary"
                                  />
                                </Stack>
                              </Stack>

                              {!!response.kpi_scores.length && (
                                <Box>
                                  <Typography sx={{ fontWeight: 700, mb: 1.2 }}>
                                    KPI Scores
                                  </Typography>
                                  <Grid container spacing={1.25}>
                                    {response.kpi_scores.map((item) => (
                                      <Grid
                                        key={item.kpi_key}
                                        size={{ xs: 12, md: 6, xl: 4 }}
                                      >
                                        <Paper
                                          variant="outlined"
                                          sx={{
                                            p: 1.5,
                                            borderRadius: 2.5,
                                            height: "100%",
                                          }}
                                        >
                                          <Typography sx={{ fontWeight: 700 }}>
                                            {item.kpi_name}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 0.6 }}
                                          >
                                            Total Score: {item.total_score}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            Questions: {item.question_count}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            Average Score: {item.average_score}
                                          </Typography>
                                        </Paper>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              )}

                              <Divider />

                              <Box>
                                <Typography sx={{ fontWeight: 700, mb: 1.2 }}>
                                  Answered Questions
                                </Typography>
                                <Stack spacing={1.25}>
                                  {response.questions.map((question, index) => (
                                    <Paper
                                      key={`${response.response_id}-${question.question_code}-${index}`}
                                      variant="outlined"
                                      sx={{ p: 1.5, borderRadius: 2.5 }}
                                    >
                                      <Stack spacing={0.75}>
                                        <Stack
                                          direction={{
                                            xs: "column",
                                            sm: "row",
                                          }}
                                          justifyContent="space-between"
                                          spacing={1}
                                        >
                                          <Typography sx={{ fontWeight: 700 }}>
                                            {question.question_text}
                                          </Typography>
                                          <Chip
                                            label={`Score: ${question.score}`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                          />
                                        </Stack>
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          Code: {question.question_code}
                                        </Typography>
                                        <Typography variant="body2">
                                          Selected Option:{" "}
                                          <Box
                                            component="span"
                                            sx={{ fontWeight: 700 }}
                                          >
                                            {question.selected_option}
                                          </Box>
                                        </Typography>
                                      </Stack>
                                    </Paper>
                                  ))}
                                </Stack>
                              </Box>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Collapse>
                </Stack>
              </Paper>
            );
          })}

        {visibleTab === "pending" && (
          <Stack spacing={1.5}>
            {!myLinksLoading && !unansweredLinks.length ? (
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
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  No pending forms
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  You have submitted all available session forms.
                </Typography>
              </Paper>
            ) : null}

            {!myLinksLoading &&
              unansweredLinks.map((item) => {
                const daysOpen = getDaysSince(item.published_at);
                const isOverdue = daysOpen !== null && daysOpen >= 7;
                const statusColor = isOverdue
                  ? {
                      main: theme.palette.error.main,
                      contrast: theme.palette.error.contrastText,
                    }
                  : {
                      main: theme.palette.warning.main,
                      contrast: theme.palette.warning.contrastText,
                    };

                return (
                  <Paper
                    key={item.session_id}
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: 3,
                      border: `1px solid ${isOverdue ? alpha(theme.palette.error.main, 0.3) : alpha(theme.palette.warning.main, 0.24)}`,
                      bgcolor: getSurfaceBackground(theme),
                    }}
                  >
                    <Stack spacing={1.75}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1.5}
                      >
                        <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
                          <Chip
                            label={isOverdue ? "OVERDUE" : "PENDING"}
                            size="small"
                            icon={
                              <HourglassBottomRoundedIcon fontSize="inherit" />
                            }
                            sx={{
                              width: "fit-content",
                              fontWeight: 800,
                              bgcolor: alpha(statusColor.main, 0.12),
                              color: statusColor.main,
                              border: `1px solid ${alpha(statusColor.main, 0.2)}`,
                            }}
                          />
                          <Typography variant="h6" sx={{ fontWeight: 850 }}>
                            {item.title}
                          </Typography>
                          <Typography color="text.secondary">
                            {item.description || "No description provided."}
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2.5,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: alpha(statusColor.main, 0.12),
                            border: `1px solid ${alpha(statusColor.main, 0.2)}`,
                            color: statusColor.main,
                            flexShrink: 0,
                          }}
                        >
                          <AssignmentTurnedInRoundedIcon fontSize="small" />
                        </Box>
                      </Stack>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Chip
                          label={`Published: ${formatDateIST(item.published_at)}`}
                          variant="outlined"
                          size="small"
                          icon={<CalendarMonthRoundedIcon />}
                        />
                        <Chip
                          label={
                            daysOpen === null
                              ? "Open form available"
                              : `Open for ${daysOpen} day${daysOpen === 1 ? "" : "s"}`
                          }
                          size="small"
                          sx={{
                            bgcolor: alpha(statusColor.main, 0.08),
                            border: `1px solid ${alpha(statusColor.main, 0.16)}`,
                            fontWeight: 700,
                          }}
                        />
                      </Stack>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        spacing={1.25}
                        alignItems={{ sm: "center" }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Review the form and submit it when you are ready.
                        </Typography>
                        <Button
                          variant="contained"
                          href={item.form_url || undefined}
                          target="_blank"
                          rel="noreferrer"
                          disabled={!item.form_url}
                          sx={{
                            minWidth: 140,
                            borderRadius: 2.2,
                            fontWeight: 800,
                          }}
                        >
                          Open Form
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
          </Stack>
        )}
      </Stack>
    </Layout>
  );
}
