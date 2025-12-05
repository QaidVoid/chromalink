export const DRAWING_COLORS = [
  "#F7768E",
  "#FF9E64",
  "#E0AF68",
  "#9ECE6A",

  "#73DACA",
  "#2AC3DE",
  "#7DCFFF",
  "#7AA2F7",

  "#BB9AF7",
  "#C0CAF5",
  "#F7768E",
  "#FF007C",

  "#FFFFFF",
  "#9AA5CE",
  "#565F89",
  "#1A1B26",
] as const;

export const DEFAULT_COLOR = "#7AA2F7";

export type Theme = "dark" | "light" | "system";

export const themes = {
  dark: {
    bg: {
      primary: "#1A1B26",
      secondary: "#24283B",
      tertiary: "#414868",
      hover: "#343B58",
    },
    text: {
      primary: "#C0CAF5",
      secondary: "#9AA5CE",
      tertiary: "#565F89",
    },
    border: {
      primary: "#414868",
      secondary: "#24283B",
    },
    accent: {
      primary: "#7AA2F7",
      secondary: "#BB9AF7",
      success: "#9ECE6A",
      error: "#F7768E",
      warning: "#E0AF68",
    },
  },
  light: {
    bg: {
      primary: "#D5D6DB",
      secondary: "#CBCCD1",
      tertiary: "#DFE0E8",
      hover: "#E9E9ED",
    },
    text: {
      primary: "#343B58",
      secondary: "#565F89",
      tertiary: "#9AA5CE",
    },
    border: {
      primary: "#CBCCD1",
      secondary: "#E9E9ED",
    },
    accent: {
      primary: "#2E7DE9",
      secondary: "#9854F1",
      success: "#587539",
      error: "#F52A65",
      warning: "#8F5E15",
    },
  },
} as const;
