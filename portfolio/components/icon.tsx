import type { ReactNode } from "react";

export type IconName =
  | "arrow-right"
  | "arrow-up-right"
  | "github"
  | "linkedin"
  | "mail"
  | "search"
  | "spark"
  | "code"
  | "layers"
  | "sun"
  | "moon"
  | "monitor"
  | "palette"
  | "file"
  | "close"
  | "camera"
  | "brain"
  | "graph"
  | "link"
  | "terminal"
  | "database"
  | "cpu"
  | "chart"
  | "school"
  | "book";

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
    moon: <path d="M20.5 13.2A8.7 8.7 0 0 1 10.8 3.5 8.7 8.7 0 1 0 20.5 13.2Z" />,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="3" /><path d="M8 21h8m-4-4v4" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    "arrow-right": <><path d="M4 12h15M13 5l7 7-7 7" /></>,
    "arrow-up-right": <><path d="M6 18 18 6M6 6h12v12" /></>,
    github: <path d="M9 19c-4.3 1.3-4.3-2.1-6-2.6m12 5v-3.3a2.9 2.9 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.7 4.7 0 0 0 18.4 6a4.4 4.4 0 0 0-.1-3.8s-1-.3-3.8 1.4a13 13 0 0 0-7 0C4.8 1.9 3.8 2.2 3.8 2.2A4.4 4.4 0 0 0 3.7 6a4.7 4.7 0 0 0-1.3 3.8c0 4.6 2.8 5.7 5.5 6A2.9 2.9 0 0 0 7 18v3.4" />,
    linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
    spark: <path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z" />,
    code: <><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18" /></>,
    layers: <><path d="m12 3 10 5-10 5L2 8l10-5Zm-9 10 9 4.5 9-4.5M3 18l9 4 9-4" /></>,
    palette: <><path d="M12 3a9 9 0 1 0 0 18h1.1a2 2 0 0 0 1.4-3.4 1.5 1.5 0 0 1 1.1-2.6h.9A4.5 4.5 0 0 0 21 10.5 7.5 7.5 0 0 0 12 3Z" /><circle cx="7.5" cy="10" r=".9" fill="currentColor" stroke="none" /><circle cx="11" cy="7" r=".9" fill="currentColor" stroke="none" /><circle cx="15" cy="8" r=".9" fill="currentColor" stroke="none" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>,
    brain: <><path d="M9.5 2a2.5 2.5 0 0 1 2.5 2.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2a2.5 2.5 0 0 0-2.5 2.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2Z" /></>,
    graph: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
    terminal: <><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></>,
    database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>,
    cpu: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3" /></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
    school: <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>,
    book: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 2v20" /></>,
  };
  return <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
