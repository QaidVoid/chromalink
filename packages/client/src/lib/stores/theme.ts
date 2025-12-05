import { writable, get } from "svelte/store";
import type { Theme } from "$lib/theme/colors";

const THEME_KEY = "chromalink-theme";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light" || stored === "system") {
    return stored;
  }

  return "system";
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;

  const actualTheme = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.setAttribute("data-theme", actualTheme);
}

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>("dark");

  // Listen to system theme changes
  if (typeof window !== "undefined") {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    mediaQuery.addEventListener("change", () => {
      const current = get({ subscribe });
      if (current === "system") {
        applyTheme("system");
      }
    });
  }

  return {
    subscribe,
    setTheme: (theme: Theme) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_KEY, theme);
        applyTheme(theme);
      }
      set(theme);
    },
    toggle: () => {
      update((current) => {
        const next = current === "dark" ? "light" : current === "light" ? "system" : "dark";
        if (typeof window !== "undefined") {
          localStorage.setItem(THEME_KEY, next);
          applyTheme(next);
        }
        return next;
      });
    },
    init: () => {
      const theme = getInitialTheme();
      applyTheme(theme);
      set(theme);
    },
  };
}

export const theme = createThemeStore();
