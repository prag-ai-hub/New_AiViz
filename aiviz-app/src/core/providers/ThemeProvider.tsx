import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { getSetting, setSetting } from "@/core/storage";
import { tokens, type ThemeColors } from "@/core/theme";

type Mode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: Mode;
  resolved: "light" | "dark";
  colors: ThemeColors;
  setMode: (m: Mode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme() ?? "dark";
  const [mode, setModeState] = useState<Mode>("dark");

  useEffect(() => {
    let cancelled = false;
    getSetting<Mode>("theme.mode", "dark").then((m) => {
      if (!cancelled) setModeState(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const resolved = mode === "system" ? (system as "light" | "dark") : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolved,
      colors: tokens.colors[resolved],
      setMode: (m) => {
        void setSetting("theme.mode", m);
        setModeState(m);
      },
    }),
    [mode, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
