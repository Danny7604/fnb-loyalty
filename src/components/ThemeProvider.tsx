"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "auto" | "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: "light" | "dark";
  setThemeMode: (mode: ThemeMode) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "auto",
  resolvedTheme: "dark",
  setThemeMode: () => {},
  cycleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  const computeTheme = (mode: ThemeMode): "light" | "dark" => {
    if (mode === "dark") return "dark";
    if (mode === "light") return "light";
    // Auto by phone clock: 18:00 -> 05:59 is dark, 06:00 -> 17:59 is light
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6 ? "dark" : "light";
  };

  const applyTheme = (resolved: "light" | "dark") => {
    setResolvedTheme(resolved);
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const saved = (localStorage.getItem("theme_mode") as ThemeMode) || "auto";
    setThemeModeState(saved);
    applyTheme(computeTheme(saved));

    // Listen for clock changes every minute in auto mode
    const interval = setInterval(() => {
      const currentMode = (localStorage.getItem("theme_mode") as ThemeMode) || "auto";
      if (currentMode === "auto") {
        applyTheme(computeTheme("auto"));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem("theme_mode", mode);
    applyTheme(computeTheme(mode));
  };

  const cycleTheme = () => {
    const next: ThemeMode = themeMode === "auto" ? "dark" : themeMode === "dark" ? "light" : "auto";
    setThemeMode(next);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, resolvedTheme, setThemeMode, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
