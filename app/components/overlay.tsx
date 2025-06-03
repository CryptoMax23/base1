'use client';
import { useState, useEffect } from 'react';

import '../../styles/overlay.css';

export default function Overlay() {
  const [isDark, setIsDark] = useState<"dark" | "light">("light");
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved ?? (prefersDark ? "dark" : "light");
    setIsDark(theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, []);
  const toggleTheme = () => {
    const next = isDark === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    setIsDark(next);
    document.documentElement.setAttribute("data-theme", next);
  };
  return (
    <button type="button" className="themeBtn" onClick={toggleTheme} aria-label={isDark === "dark" ? "Light Mode" : "Dark Mode"}>
      {isDark === "dark" ? '🌞' : '🌚'}
    </button>
  );
}
