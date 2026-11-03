// Build-time static hex color tokens matching Material 3 Default palette.
// ImageResponse runs in a specialized environment where CSS variables are unavailable,
// so all OG / Twitter preview colors must be resolved to exact hex values here.

export const OG_COLORS = {
  // Surfaces
  background: "#141318",
  surface: "#211F27",
  surfaceContainer: "#2D2935",
  surfaceContainerHigh: "#383342",
  surfaceContainerHighest: "#443E4F",

  // Primary Violet
  primary: "#CFB7FF",
  primaryContainer: "#6142AE",
  onPrimary: "#381E68",
  onPrimaryContainer: "#E9DDFF",

  // Secondary Lime
  secondary: "#E3F29C",
  secondaryContainer: "#3D4E12",
  onSecondary: "#292431",
  onSecondaryContainer: "#E3F29C",

  // Tertiary Warm Amber / Bronze
  tertiary: "#FFB68C",
  tertiaryContainer: "#6E3917",
  onTertiaryContainer: "#FFDBCB",

  // Text / Content
  onSurface: "#F4EFF8",
  onSurfaceVariant: "#C6BDCF",
  outline: "#9687AB",
  outlineVariant: "#51495E",
} as const;

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export function getProductionSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://meetkapadia.dev";
}

