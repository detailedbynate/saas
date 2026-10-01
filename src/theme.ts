import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/** Outlier's brand tokens, taken from the app's globals.css. */
export const C = {
  page: "#000000",
  surface: "#0c0c11",
  control: "#121218",
  text: "#f5f5f7",
  textSecondary: "#adadb8",
  muted: "#7b7b88",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  accent: "#8b5cf6",
  accentText: "#c4b5fd",
  accentSoft: "#a78bfa",
  accentWash: "rgba(139,92,246,0.14)",
  good: "#34d399",
  glass: "rgba(255,255,255,0.045)",
  glassBorder: "rgba(255,255,255,0.09)",
};

export const FONT = {
  display: "'Schibsted Grotesk', 'DM Sans', sans-serif",
  body: "'DM Sans', sans-serif",
};

const faces: [string, string, number][] = [
  ["DM Sans", "dm-sans-latin-400-normal", 400],
  ["DM Sans", "dm-sans-latin-500-normal", 500],
  ["DM Sans", "dm-sans-latin-700-normal", 700],
  ["Schibsted Grotesk", "schibsted-grotesk-latin-500-normal", 500],
  ["Schibsted Grotesk", "schibsted-grotesk-latin-700-normal", 700],
  ["Schibsted Grotesk", "schibsted-grotesk-latin-800-normal", 800],
];

export const fontsReady = Promise.all(
  faces.map(([family, file, weight]) =>
    loadFont({ family, url: staticFile(`fonts/${file}.woff2`), weight: String(weight) }),
  ),
);

export const GRADIENT_TEXT = {
  background: "linear-gradient(100deg, #ffffff 0%, #c4b5fd 45%, #8b5cf6 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;
