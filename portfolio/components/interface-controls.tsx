"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { interfaceCopy as copy } from "@/content/interface";
import { Icon } from "./icon";
const ToastContext = createContext<(message: string) => void>(() => {});
export function useToast() { return useContext(ToastContext); }

export type ThemeChoice = "light" | "dark" | "system";

type ThemeTransition = { skipTransition: () => void; finished: Promise<void> };
type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => ThemeTransition };
let activeThemeTransition: ThemeTransition | null = null;

function applyThemeChoice(value: ThemeChoice) {
  const root = document.documentElement;
  root.dataset.preference = value;
  root.dataset.theme = value === "system" ? matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : value;
  try { localStorage.setItem("portfolio-theme", value); } catch {}
  window.dispatchEvent(new CustomEvent<ThemeChoice>("portfolio:theme-choice", { detail: value }));
  window.dispatchEvent(new CustomEvent("portfolio:theme-effective", { detail: root.dataset.theme }));
}

export function runThemeReveal(update: () => void, origin?: HTMLElement | null) {
  const root = document.documentElement;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const viewTransitionDocument = document as ViewTransitionDocument;

  if (reducedMotion) {
    update();
    return;
  }

  const rect = origin?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  const farthestX = Math.max(x, window.innerWidth - x);
  const farthestY = Math.max(y, window.innerHeight - y);
  const radius = Math.ceil(Math.hypot(farthestX, farthestY));
  root.style.setProperty("--theme-reveal-x", `${x}px`);
  root.style.setProperty("--theme-reveal-y", `${y}px`);
  root.style.setProperty("--theme-reveal-radius", `${radius}px`);

  if (viewTransitionDocument.startViewTransition) {
    activeThemeTransition?.skipTransition();
    const transition = viewTransitionDocument.startViewTransition(update);
    activeThemeTransition = transition;
    void transition.finished.catch(() => {}).finally(() => {
      if (activeThemeTransition === transition) activeThemeTransition = null;
    });
    return;
  }

  update();
  root.animate([{ opacity: 0.86 }, { opacity: 1 }], {
    duration: 160,
    easing: getComputedStyle(root).getPropertyValue("--motion-project-effects-easing").trim() || "ease-out",
  });
}

export function setThemeChoice(value: ThemeChoice, origin?: HTMLElement | null) {
  runThemeReveal(() => applyThemeChoice(value), origin);
}

export function toggleThemeChoice() {
  const value: ThemeChoice = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setThemeChoice(value);
}
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{message: string; id: number} | null>(null);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), 7000); const dismiss = (event: KeyboardEvent) => { if (event.key === "Escape") setToast(null); }; window.addEventListener("keydown", dismiss); return () => { clearTimeout(timer); window.removeEventListener("keydown", dismiss); }; }, [toast]);
  return <ToastContext.Provider value={(message) => setToast({ message, id: Date.now() })}>{children}<div className="toast-region" role="status" aria-live="polite" aria-atomic="true">{toast ? <div className="toast" key={toast.id}><span>{toast.message}</span><button type="button" onClick={() => setToast(null)} aria-label={copy.dismiss}>×</button></div> : null}</div></ToastContext.Provider>;
}
export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  useEffect(() => { setChoice(document.documentElement.dataset.preference as ThemeChoice || "system"); const media = matchMedia("(prefers-color-scheme: dark)"); const update = () => { if ((document.documentElement.dataset.preference || "system") === "system") { document.documentElement.dataset.theme = media.matches ? "dark" : "light"; window.dispatchEvent(new CustomEvent("portfolio:theme-effective", { detail: document.documentElement.dataset.theme })); } }; const onChoice = (event: Event) => setChoice((event as CustomEvent<ThemeChoice>).detail); media.addEventListener("change", update); window.addEventListener("portfolio:theme-choice", onChoice); return () => { media.removeEventListener("change", update); window.removeEventListener("portfolio:theme-choice", onChoice); }; }, []);
  const options = [{ value: "light", label: copy.light, icon: "sun" }, { value: "dark", label: copy.dark, icon: "moon" }, { value: "system", label: copy.system, icon: "monitor" }] as const;
  return <fieldset className="theme-control"><legend className="sr-only">{copy.theme}</legend>{options.map((option) => <label className="theme-option" key={option.value} title={option.label}><input className="sr-only" type="radio" name="appearance" value={option.value} checked={choice === option.value} onChange={(event) => { setChoice(option.value); setThemeChoice(option.value, event.currentTarget.closest(".theme-option") as HTMLElement | null); }} /><span className="theme-icon"><Icon name={option.icon} /></span><span className="sr-only">{option.label}</span></label>)}</fieldset>;
}
export function CopyEmail({ email }: { email: string }) {
  const notify = useContext(ToastContext);
  const [fallback, setFallback] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (fallback) { input.current?.focus(); input.current?.select(); } }, [fallback]);
  async function copyAddress() {
    try { if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable"); await navigator.clipboard.writeText(email); setFallback(false); notify(copy.copied); }
    catch { setFallback(true); notify(copy.copyFailed); }
  }
  return <span className="copy-email"><button className="button button-secondary" type="button" onClick={copyAddress}>{copy.copyEmail}</button>{fallback ? <input ref={input} readOnly value={email} aria-label={copy.copyEmail} onFocus={(event) => event.target.select()} /> : null}</span>;
}
