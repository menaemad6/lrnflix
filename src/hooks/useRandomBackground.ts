import { useMemo } from "react";

const backgrounds = [
  "premium-bg-aurora",
  "premium-bg-lines",
  "premium-bg-mesh",
  "premium-bg-vignette",
  "premium-bg-glass",
  "premium-bg-plain",
  "premium-bg-vertical-lines",
  "premium-bg-spotlight",
  "premium-bg-gradient"
];

export function useRandomBackground() {
  return useMemo(() => {
    const idx = Math.floor(Math.random() * backgrounds.length);
    return backgrounds[idx];
  }, []);
} 