export interface ShortcutItem {
  id: string;
  key: string;
  displayKey: string;
  description: string;
  group: "Navigation" | "Appearance" | "General";
  requiresModifier?: boolean;
  targetHref?: string;
  actionId?: string;
}

export const SHORTCUTS: readonly ShortcutItem[] = [
  // Navigation
  { id: "nav-home", key: "1", displayKey: "1", description: "Navigate to Home", group: "Navigation", targetHref: "/" },
  { id: "nav-projects", key: "2", displayKey: "2", description: "Navigate to Projects", group: "Navigation", targetHref: "/projects" },
  { id: "nav-about", key: "3", displayKey: "3", description: "Navigate to About", group: "Navigation", targetHref: "/about" },
  { id: "nav-skills", key: "4", displayKey: "4", description: "Navigate to Skills", group: "Navigation", targetHref: "/skills" },
  { id: "nav-achievements", key: "5", displayKey: "5", description: "Navigate to Achievements", group: "Navigation", targetHref: "/achievements" },
  { id: "nav-contact", key: "6", displayKey: "6", description: "Navigate to Contact", group: "Navigation", targetHref: "/contact" },

  // Appearance
  { id: "toggle-theme", key: "t", displayKey: "T", description: "Toggle Light / Dark mode", group: "Appearance", actionId: "toggle-theme" },

  // General
  { id: "open-command", key: "k", displayKey: "⌘K", description: "Open Command Palette", group: "General", requiresModifier: true, actionId: "open-command" },
  { id: "open-shortcuts", key: "?", displayKey: "?", description: "Show Keyboard Shortcuts helper", group: "General", actionId: "open-shortcuts" },
  { id: "close-dialog", key: "Escape", displayKey: "Esc", description: "Close active dialog or sheet", group: "General", actionId: "close-dialog" },
];

export const SHORTCUT_GROUPS = ["Navigation", "Appearance", "General"] as const;

