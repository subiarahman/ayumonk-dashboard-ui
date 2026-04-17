import { createContext, useContext } from "react";

export const ThemeModeContext = createContext({
  mode: "light",
  toggleColorMode: () => {},
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
