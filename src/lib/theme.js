// Light / dark / match-the-device appearance, remembered per browser.

export const THEMES = ["system", "light", "dark"];
const KEY = "theme";
const COLORS = { light: "#fafaf9", dark: "#121110" };

export function getTheme() {
  try {
    const t = localStorage.getItem(KEY);
    return THEMES.includes(t) ? t : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(theme = getTheme()) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", dark ? COLORS.dark : COLORS.light));
}

export function setTheme(theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
  applyTheme(theme);
}

// Runs before the page paints so there's no flash of the wrong theme.
export const themeScript = `(function(){try{var t=localStorage.getItem("${KEY}");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"${COLORS.dark}":"${COLORS.light}")}catch(e){}})()`;
