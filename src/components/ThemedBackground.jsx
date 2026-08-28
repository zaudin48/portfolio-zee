import { useEffect, useState } from "react";
import WebBackground from "./WebBackground";
import LightningBackground from "./LightningBackground";
import ThreadsBackground from "./ThreadsBackground";
import { onThemeChange, FALLBACK_THEME } from "../lib/theme";

// Renders whichever background effect the CURRENT theme specifies.
// Listens for theme-change events so it swaps live, from anywhere
// (the pull-to-cycle gesture, or a future in-admin preview), without
// needing a page reload.
export default function ThemedBackground() {
  const [style, setStyle] = useState(FALLBACK_THEME.backgroundStyle);

  useEffect(() => {
    const unsub = onThemeChange((e) => {
      setStyle(e.detail?.backgroundStyle || "webs");
    });
    return unsub;
  }, []);

  if (style === "lightning") return <LightningBackground />;
  if (style === "threads") return <ThreadsBackground />;
  return <WebBackground />;
}