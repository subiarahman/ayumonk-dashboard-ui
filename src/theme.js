import { alpha, createTheme } from "@mui/material/styles";

export const THEME_MODE_KEY = "appThemeMode";

export function getSurfaceBackground(theme, opacity = 0.86) {
  return alpha(
    theme.palette.background.paper,
    theme.palette.mode === "dark" ? Math.max(opacity, 0.92) : opacity,
  );
}

export function getRaisedGradient(theme, accent = theme.palette.primary.main) {
  const isDark = theme.palette.mode === "dark";

  return `linear-gradient(135deg, ${alpha(accent, isDark ? 0.16 : 0.08)} 0%, ${getSurfaceBackground(theme, isDark ? 0.98 : 0.94)} 100%)`;
}

export function getStoredThemeMode() {
  if (typeof window === "undefined") return "light";

  const storedMode = window.localStorage.getItem(THEME_MODE_KEY);
  return storedMode === "dark" ? "dark" : "light";
}

export function createAppTheme(mode = "light") {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#2dd4bf" : "#0f766e",
        dark: isDark ? "#14b8a6" : "#115e59",
        light: isDark ? "#5eead4" : "#14b8a6",
        contrastText: isDark ? "#042f2e" : "#ffffff",
      },
      background: {
        default: isDark ? "#071412" : "#f7f2e9",
        paper: isDark ? "#102320" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f3f4f6" : "#1f2937",
        secondary: isDark ? "#9ca3af" : "#5f6672",
      },
      divider: isDark
        ? alpha("#d1fae5", 0.12)
        : alpha("#0f172a", 0.08),
    },
    typography: {
      fontFamily: "'Space Grotesk', 'Poppins', 'Segoe UI', sans-serif",
      h4: { fontWeight: 800 },
      h5: { fontWeight: 750 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            minHeight: "100vh",
            background: isDark
              ? [
                  `radial-gradient(circle at 0% 10%, ${alpha("#14b8a6", 0.16)}, transparent 40%)`,
                  `radial-gradient(circle at 100% 90%, ${alpha("#f59e0b", 0.12)}, transparent 28%)`,
                  "linear-gradient(165deg, #071412 0%, #0d1f1b 100%)",
                ].join(", ")
              : [
                  `radial-gradient(circle at 0% 10%, ${alpha("#14b8a6", 0.2)}, transparent 40%)`,
                  `radial-gradient(circle at 100% 90%, ${alpha("#f59e0b", 0.18)}, transparent 30%)`,
                  "linear-gradient(165deg, #fcfbf8 0%, #f5efe5 100%)",
                ].join(", "),
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? alpha("#d1fae5", 0.04)
              : alpha("#ffffff", 0.7),
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            borderColor: isDark
              ? alpha("#d1fae5", 0.14)
              : alpha("#0f172a", 0.08),
            backgroundColor: isDark
              ? alpha("#081512", 0.68)
              : alpha("#ffffff", 0.72),
          },
          columnHeaders: {
            backgroundColor: isDark
              ? alpha("#d1fae5", 0.08)
              : alpha("#0f766e", 0.04),
            borderBottomColor: isDark
              ? alpha("#d1fae5", 0.12)
              : alpha("#0f172a", 0.08),
          },
          cell: {
            borderBottomColor: isDark
              ? alpha("#d1fae5", 0.1)
              : alpha("#0f172a", 0.06),
          },
          footerContainer: {
            borderTopColor: isDark
              ? alpha("#d1fae5", 0.12)
              : alpha("#0f172a", 0.08),
          },
        },
      },
    },
  });
}
