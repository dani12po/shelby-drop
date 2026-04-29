import { describe, it, expect } from "vitest";
import {
  THEMES, DEFAULT_THEME, VALID_THEME_KEYS,
  isValidTheme, getTheme,
} from "@/lib/theme-constants";

describe("theme-constants", () => {
  it("has dark and light themes", () => {
    expect(THEMES.dark).toBeDefined();
    expect(THEMES.light).toBeDefined();
  });

  it("dark theme isDark=true, light isDark=false", () => {
    expect(THEMES.dark.isDark).toBe(true);
    expect(THEMES.light.isDark).toBe(false);
  });

  it("DEFAULT_THEME is dark", () => {
    expect(DEFAULT_THEME).toBe("dark");
  });

  it("VALID_THEME_KEYS contains dark and light", () => {
    expect(VALID_THEME_KEYS).toContain("dark");
    expect(VALID_THEME_KEYS).toContain("light");
  });

  it("isValidTheme accepts dark and light", () => {
    expect(isValidTheme("dark")).toBe(true);
    expect(isValidTheme("light")).toBe(true);
  });

  it("isValidTheme rejects old keys and garbage", () => {
    expect(isValidTheme("space")).toBe(false);
    expect(isValidTheme("aurora")).toBe(false);
    expect(isValidTheme(null)).toBe(false);
    expect(isValidTheme(undefined)).toBe(false);
    expect(isValidTheme("")).toBe(false);
    expect(isValidTheme("DARK")).toBe(false);
  });

  it("getTheme returns correct config", () => {
    expect(getTheme("dark").isDark).toBe(true);
    expect(getTheme("light").isDark).toBe(false);
  });
});
