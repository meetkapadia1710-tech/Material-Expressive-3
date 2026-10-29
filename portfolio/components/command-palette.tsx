"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { interfaceCopy as copy } from "@/content/interface";
import { navigation } from "@/content/profile";
import { projectCatalogCopy, projects } from "@/content/projects";
import { links } from "@/content/links";
import { useToast, toggleThemeChoice } from "@/components/interface-controls";
import { Icon } from "@/components/icon";
import styles from "./command-palette.module.css";

type GroupName = "Recent" | "Pages" | "Projects" | "Actions";
type CommandItem = {
  id: string;
  label: string;
  detail: string;
  group: GroupName;
  href?: string;
  external?: boolean;
  action?: "copy-email" | "toggle-theme";
  searchText?: string;
};

const RECENT_KEY = "portfolio-command-recent";

function itemId(item: CommandItem) {
  return `command-option-${item.group.toLowerCase()}-${item.id}`.replace(/[^a-z0-9_-]/gi, "-");
}

function fuzzyScore(query: string, value: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const fields = value.split("\u0000").map((field) => field.toLowerCase());

  function scoreTerm(term: string) {
    let best = Number.POSITIVE_INFINITY;
    fields.forEach((field, fieldIndex) => {
      const fieldPriority = fieldIndex * 5;
      const exactIndex = field.indexOf(term);
      if (exactIndex >= 0) {
        const startsAtWord = exactIndex === 0 || /\W/.test(field[exactIndex - 1] ?? " ");
        const score = fieldPriority + (startsAtWord ? 0 : 2) + exactIndex * 0.02;
        best = Math.min(best, score);
        return;
      }

      let cursor = 0;
      let first = -1;
      let last = -1;
      for (const character of term) {
        const found = field.indexOf(character, cursor);
        if (found < 0) return;
        if (first < 0) first = found;
        last = found;
        cursor = found + 1;
      }

      const gaps = last - first + 1 - term.length;
      const maxGaps = Math.max(2, Math.floor(term.length / 3));
      if (gaps <= maxGaps) {
        best = Math.min(best, fieldPriority + 12 + gaps * 2 + first * 0.02);
      }
    });
    return best;
  }

  if (terms.length === 0) return 0;
  const scores = terms.map(scoreTerm);
  if (scores.some((score) => !Number.isFinite(score))) return null;
  return scores.reduce((total, score) => total + score, 0);
}

function Highlight({ text, query }: { text: string; query: string }) {
  const characters = query.toLowerCase().replace(/\s+/g, "").split("");
  const matched = new Set<number>();
  let cursor = 0;
  for (const character of characters) {
    const found = text.toLowerCase().indexOf(character, cursor);
    if (found < 0) continue;
    matched.add(found);
    cursor = found + 1;
  }
  return <>{Array.from(text).map((character, index) => matched.has(index) ? <mark key={index}>{character}</mark> : <span key={index}>{character}</span>)}</>;
}

function getBaseItems(): CommandItem[] {
  const pages: CommandItem[] = navigation.map((page) => ({ id: `page:${page.href}`, label: page.label, detail: page.href, group: "Pages", href: page.href }));
  const projectItems: CommandItem[] = projects.toSorted((a, b) => a.order - b.order).map((project) => ({
    id: `project:${project.slug}`,
    label: project.name,
    detail: project.verification === "unverified" ? projectCatalogCopy.reviewLabel : project.category ?? project.status ?? "",
    group: "Projects",
    href: `/projects/${project.slug}`,
    searchText: [project.name, project.tagline, project.category, project.status, project.reviewNote, ...(project.stack ?? [])].filter(Boolean).join(" "),
  }));
  const actions: CommandItem[] = [
    { id: "action:copy-email", label: copy.command.copyEmail, detail: links.email.value ?? "", group: "Actions", action: "copy-email" },
    ...(links.github.href ? [{ id: "action:github", label: copy.command.openGithub, detail: links.github.value ?? "", group: "Actions" as const, href: links.github.href, external: true }] : []),
    ...(links.linkedin.href ? [{ id: "action:linkedin", label: copy.command.openLinkedIn, detail: links.linkedin.value ?? "", group: "Actions" as const, href: links.linkedin.href, external: true }] : []),
    ...(links.resume.href ? [{ id: "action:resume", label: copy.command.openResume, detail: links.resume.verification === "unverified" ? copy.command.unverified : links.resume.value ?? "", group: "Actions" as const, href: links.resume.href, external: true }] : []),
    { id: "action:theme", label: copy.command.toggleTheme, detail: "", group: "Actions", action: "toggle-theme" },
  ];
  return [...pages, ...projectItems, ...actions];
}

export default function CommandPalette({ open, onDismiss }: { open: boolean; onDismiss: () => void }) {
  const notify = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const baseItems = useMemo(() => getBaseItems(), []);
  const byId = useMemo(() => new Map(baseItems.map((item) => [item.id, item])), [baseItems]);

  useEffect(() => {
    if (!open) {
      if (dialogRef.current?.open) dialogRef.current.close();
      return;
    }
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    inputRef.current?.focus();
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      setRecentIds(Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string").slice(0, 5) : []);
    } catch { setRecentIds([]); }
  }, [open]);

  const groups = useMemo(() => {
    const recent = recentIds.map((id) => byId.get(id)).filter((item): item is CommandItem => Boolean(item)).map((item) => ({ ...item, group: "Recent" as const }));
    const source: { group: GroupName; items: CommandItem[] }[] = [
      { group: "Recent", items: recent },
      { group: "Pages", items: baseItems.filter((item) => item.group === "Pages") },
      { group: "Projects", items: baseItems.filter((item) => item.group === "Projects") },
      { group: "Actions", items: baseItems.filter((item) => item.group === "Actions") },
    ];
    return source.map(({ group, items }) => ({
      group,
      items: items.map((item) => ({ item, score: query.trim() ? fuzzyScore(query, [item.label, item.detail, item.searchText ?? ""].join("\u0000")) : 0 }))
        .filter((result): result is { item: CommandItem; score: number } => result.score !== null && !(query.trim() && group !== "Recent" && recentIds.includes(result.item.id)))
        .sort((a, b) => a.score - b.score)
        .map(({ item }) => item),
    })).filter(({ items }) => items.length > 0);
  }, [baseItems, byId, query, recentIds]);
  const flatItems = groups.flatMap((group) => group.items);
  const activeItem = flatItems[activeIndex];

  function saveRecent(item: CommandItem) {
    const next = [item.id, ...recentIds.filter((id) => id !== item.id)].slice(0, 5);
    setRecentIds(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  }

  async function copyAddress() {
    const email = links.email.value;
    if (!email) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(email);
      notify(copy.copied);
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = email;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.append(fallback);
      fallback.select();
      const copied = document.execCommand("copy");
      fallback.remove();
      notify(copied ? copy.copied : copy.copyFailed);
    }
  }

  function selectItem(item: CommandItem) {
    saveRecent(item);
    if (item.action === "copy-email") { void copyAddress(); return; }
    if (item.action === "toggle-theme") { toggleThemeChoice(); return; }
    if (item.href && item.external) { window.open(item.href, "_blank", "noopener,noreferrer"); return; }
    if (item.href) window.dispatchEvent(new CustomEvent("portfolio:route-request", { detail: item.href }));
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (!flatItems.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => (index + 1) % flatItems.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => (index - 1 + flatItems.length) % flatItems.length); }
    if (event.key === "Home") { event.preventDefault(); setActiveIndex(0); }
    if (event.key === "End") { event.preventDefault(); setActiveIndex(flatItems.length - 1); }
    if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      dialogRef.current?.close();
      onDismiss();
      selectItem(activeItem);
    }
  }

  useEffect(() => { setActiveIndex(0); }, [query]);
  useEffect(() => {
    if (activeItem) document.getElementById(itemId(activeItem))?.scrollIntoView({ block: "nearest" });
  }, [activeItem]);

  let optionIndex = 0;
  return <dialog ref={dialogRef} className={styles.dialog} aria-modal="true" aria-labelledby="command-palette-title" onCancel={(event) => { event.preventDefault(); event.currentTarget.close(); onDismiss(); }} onClose={onDismiss} onClick={(event) => { if (event.target === event.currentTarget) { event.currentTarget.close(); onDismiss(); } }}>
    <h2 id="command-palette-title" className="sr-only">{copy.command.title}</h2>
    <div className={styles.searchRow}><Icon name="search" /><input ref={inputRef} role="combobox" aria-label={copy.command.placeholder} aria-autocomplete="list" aria-expanded="true" aria-controls="command-palette-list" aria-activedescendant={activeItem ? itemId(activeItem) : undefined} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={onKeyDown} placeholder={copy.command.placeholder} autoComplete="off" /><kbd>ESC</kbd><button type="button" className={styles.closeButton} aria-label="Close command palette" onClick={(event) => { event.currentTarget.closest("dialog")?.close(); onDismiss(); }}>×</button></div>
    <p className={styles.resultCount} role="status" aria-live="polite" aria-atomic="true">{copy.command.resultCount(flatItems.length)}</p>
    <div className={styles.results}>
      <div id="command-palette-list" role="listbox" aria-label={copy.command.title} aria-activedescendant={activeItem ? itemId(activeItem) : undefined}>
        {groups.length ? groups.map(({ group, items }) => <div role="group" aria-label={copy.command[group.toLowerCase() as "recent" | "pages" | "projects" | "actions"]} key={group}>
          <h3 className={styles.groupHeading}>{copy.command[group.toLowerCase() as "recent" | "pages" | "projects" | "actions"]}</h3>
          {items.map((item) => {
            const index = optionIndex++;
            return <div id={itemId(item)} key={`${group}-${item.id}`} role="option" aria-selected={index === activeIndex} className={`${styles.option}${index === activeIndex ? ` ${styles.active}` : ""}`} onMouseMove={() => setActiveIndex(index)} onClick={(event) => { event.currentTarget.closest("dialog")?.close(); onDismiss(); selectItem(item); }}>
              <span className={styles.optionText}><strong><Highlight text={item.label} query={query} /></strong>{item.detail ? <small>{item.detail}</small> : null}</span>
              <span className={styles.optionEnd}>{item.external ? <Icon name="arrow-up-right" /> : item.href ? <kbd>↵</kbd> : null}</span>
            </div>;
          })}
        </div>) : <p className={styles.empty}>{copy.command.empty}</p>}
      </div>
    </div>
  </dialog>;
}
