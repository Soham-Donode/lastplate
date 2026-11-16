import { THEME_STORAGE_KEY } from "@/lib/constants";

const initializeTheme = `
  (() => {
    let stored;
    try {
      stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    } catch {}
    const dark = stored === "dark";
    document.documentElement.classList.toggle("dark", dark);
  })();
`;

export function ThemeInitializer() {
  return <script dangerouslySetInnerHTML={{ __html: initializeTheme }} />;
}
