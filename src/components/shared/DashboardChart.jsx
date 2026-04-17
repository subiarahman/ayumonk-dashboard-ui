import { useMemo } from "react";
import { alpha } from "@mui/material/styles";
import { Paper, Typography, useTheme } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { getSurfaceBackground } from "../../theme";

export default function DashboardChart({ title, data, lines }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const chartColors = useMemo(
    () => ({
      grid: isDark ? alpha("#d1fae5", 0.08) : "#ded9cf",
      axis: theme.palette.text.secondary,
      tooltipBackground: getSurfaceBackground(theme, 0.98),
      tooltipBorder: alpha(theme.palette.divider, 1),
    }),
    [isDark, theme],
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: getSurfaceBackground(theme),
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {title}
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis dataKey="name" tick={{ fill: chartColors.axis }} axisLine={{ stroke: chartColors.grid }} tickLine={{ stroke: chartColors.grid }} />
          <YAxis tick={{ fill: chartColors.axis }} axisLine={{ stroke: chartColors.grid }} tickLine={{ stroke: chartColors.grid }} />
          <Tooltip
            contentStyle={{
              backgroundColor: chartColors.tooltipBackground,
              border: `1px solid ${chartColors.tooltipBorder}`,
              borderRadius: 12,
            }}
          />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2.5}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
