const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const CV_COLOR_PRESETS = [
  {
    id: "teal",
    label: "Emerald",
    colors: {
      accent: "#0f766e",
      accentStrong: "#0b4f46",
      text: "#11212d",
      muted: "#59707d",
    },
  },
  {
    id: "navy",
    label: "Navy",
    colors: {
      accent: "#1d4ed8",
      accentStrong: "#1e3a8a",
      text: "#0f172a",
      muted: "#526072",
    },
  },
  {
    id: "plum",
    label: "Plum",
    colors: {
      accent: "#9d174d",
      accentStrong: "#6b1737",
      text: "#1f1a24",
      muted: "#6c6173",
    },
  },
  {
    id: "amber",
    label: "Amber",
    colors: {
      accent: "#b45309",
      accentStrong: "#7c2d12",
      text: "#1c1917",
      muted: "#6b625c",
    },
  },
];

export const DEFAULT_CV_THEME_PRESET_ID = CV_COLOR_PRESETS[0].id;

function clampChannel(value) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function normalizeHexColor(value, fallback) {
  const candidate = String(value || "").trim();

  if (!HEX_COLOR_PATTERN.test(candidate)) {
    return fallback;
  }

  if (candidate.length === 4) {
    const [, r, g, b] = candidate;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return candidate.toLowerCase();
}

function hexToRgb(hex) {
  const safeHex = normalizeHexColor(hex, "#000000").slice(1);
  return {
    r: Number.parseInt(safeHex.slice(0, 2), 16),
    g: Number.parseInt(safeHex.slice(2, 4), 16),
    b: Number.parseInt(safeHex.slice(4, 6), 16),
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mix(hexA, hexB, weightOfB = 0.5) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const ratio = Math.min(1, Math.max(0, weightOfB));
  const blended = {
    r: clampChannel(a.r + ((b.r - a.r) * ratio)),
    g: clampChannel(a.g + ((b.g - a.g) * ratio)),
    b: clampChannel(a.b + ((b.b - a.b) * ratio)),
  };

  return `#${[blended.r, blended.g, blended.b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

function getPresetColors(presetId) {
  return (
    CV_COLOR_PRESETS.find((preset) => preset.id === presetId)?.colors
    || CV_COLOR_PRESETS[0].colors
  );
}

export function createDefaultCvTheme() {
  return {
    presetId: DEFAULT_CV_THEME_PRESET_ID,
    customColors: {},
  };
}

export function normalizeStoredCvTheme(theme) {
  const presetId = theme?.presetId === "custom" || CV_COLOR_PRESETS.some((preset) => preset.id === theme?.presetId)
    ? theme.presetId
    : DEFAULT_CV_THEME_PRESET_ID;
  const presetColors = getPresetColors(presetId === "custom" ? DEFAULT_CV_THEME_PRESET_ID : presetId);
  const customColors = theme?.customColors && typeof theme.customColors === "object"
    ? {
        accent: normalizeHexColor(theme.customColors.accent, presetColors.accent),
        accentStrong: normalizeHexColor(theme.customColors.accentStrong, presetColors.accentStrong),
        text: normalizeHexColor(theme.customColors.text, presetColors.text),
        muted: normalizeHexColor(theme.customColors.muted, presetColors.muted),
      }
    : {};

  return {
    presetId,
    customColors,
  };
}

export function resolveCvTheme(theme) {
  const normalized = normalizeStoredCvTheme(theme);
  const preset = normalized.presetId === "custom"
    ? null
    : CV_COLOR_PRESETS.find((candidate) => candidate.id === normalized.presetId);
  const colors = {
    ...getPresetColors(normalized.presetId === "custom" ? DEFAULT_CV_THEME_PRESET_ID : normalized.presetId),
    ...normalized.customColors,
  };

  return {
    ...normalized,
    label: preset?.label || "Custom",
    accent: colors.accent,
    accentStrong: colors.accentStrong,
    text: colors.text,
    muted: colors.muted,
    line: rgba(colors.text, 0.14),
    lineStrong: rgba(colors.text, 0.22),
    surface: rgba(colors.accent, 0.06),
    surfaceStrong: rgba(colors.accent, 0.1),
    hover: rgba(colors.accent, 0.08),
    chipBorder: rgba(colors.accent, 0.18),
    chipBackground: rgba(colors.accent, 0.06),
    copyStrong: mix(colors.text, colors.accentStrong, 0.2),
    copySoft: mix(colors.text, "#ffffff", 0.18),
    mutedSoft: mix(colors.muted, "#ffffff", 0.18),
  };
}

export function getCvThemeStyle(theme) {
  const resolved = resolveCvTheme(theme);

  return {
    "--cv-text": resolved.text,
    "--cv-muted": resolved.muted,
    "--cv-accent": resolved.accent,
    "--cv-accent-strong": resolved.accentStrong,
    "--cv-line": resolved.line,
    "--cv-line-strong": resolved.lineStrong,
    "--cv-surface": resolved.surface,
    "--cv-surface-strong": resolved.surfaceStrong,
    "--cv-hover": resolved.hover,
    "--cv-chip-border": resolved.chipBorder,
    "--cv-chip-bg": resolved.chipBackground,
    "--cv-copy-strong": resolved.copyStrong,
    "--cv-copy-soft": resolved.copySoft,
    "--cv-muted-soft": resolved.mutedSoft,
  };
}
