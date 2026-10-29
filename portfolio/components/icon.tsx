export type IconName = "arrow-right" | "arrow-up-right" | "github" | "mail" | "search" | "spark" | "code" | "layers" | "sun" | "moon" | "monitor" | "palette";

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
    moon: <path d="M20.5 13.2A8.7 8.7 0 0 1 10.8 3.5 8.7 8.7 0 1 0 20.5 13.2Z" />,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="3" /><path d="M8 21h8m-4-4v4" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    "arrow-right": <><path d="M4 12h15M13 5l7 7-7 7" /></>,
    "arrow-up-right": <><path d="M6 18 18 6M6 6h12v12" /></>,
    github: <path d="M9 19c-4.3 1.3-4.3-2.1-6-2.6m12 5v-3.3a2.9 2.9 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.7 4.7 0 0 0 18.4 6a4.4 4.4 0 0 0-.1-3.8s-1-.3-3.8 1.4a13 13 0 0 0-7 0C4.8 1.9 3.8 2.2 3.8 2.2A4.4 4.4 0 0 0 3.7 6a4.7 4.7 0 0 0-1.3 3.8c0 4.6 2.8 5.7 5.5 6A2.9 2.9 0 0 0 7 18v3.4" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
    spark: <path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z" />,
    code: <><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18" /></>,
    layers: <><path d="m12 3 10 5-10 5L2 8l10-5Zm-9 10 9 4.5 9-4.5M3 18l9 4 9-4" /></>,
    palette: <><path d="M12 3a9 9 0 1 0 0 18h1.1a2 2 0 0 0 1.4-3.4 1.5 1.5 0 0 1 1.1-2.6h.9A4.5 4.5 0 0 0 21 10.5 7.5 7.5 0 0 0 12 3Z" /><circle cx="7.5" cy="10" r=".9" fill="currentColor" stroke="none" /><circle cx="11" cy="7" r=".9" fill="currentColor" stroke="none" /><circle cx="15" cy="8" r=".9" fill="currentColor" stroke="none" /></>,
  };
  return <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
