import { useMemo } from "react";

const backgrounds = [
  "premium-bg-aurora",
  "premium-bg-mesh",
  "premium-bg-vignette",
  "premium-bg-glass",
  "premium-bg-plain",
  "premium-bg-spotlight",
  "premium-bg-gradient",
  "premium-bg-cosmic",
  "premium-bg-ripple",
  "premium-bg-geometric",
  "premium-bg-fluid",
  "premium-bg-crystal",
  "premium-bg-neon",
  "premium-bg-organic"
];

export function useRandomBackground() {
  return useMemo(() => {
    const idx = Math.floor(Math.random() * backgrounds.length);
    return backgrounds[idx];
  }, []);
} 