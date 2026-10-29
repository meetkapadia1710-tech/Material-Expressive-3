"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { interfaceCopy as copy } from "@/content/interface";
import { Icon } from "./icon";
const ToastContext = createContext<(message: string) => void>(() => {});
export function useToast() { return useContext(ToastContext); }
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{message: string; id: number} | null>(null);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), 7000); const dismiss = (event: KeyboardEvent) => { if (event.key === "Escape") setToast(null); }; window.addEventListener("keydown", dismiss); return () => { clearTimeout(timer); window.removeEventListener("keydown", dismiss); }; }, [toast]);
  return <ToastContext.Provider value={(message) => setToast({ message, id: Date.now() })}>{children}<div className="toast-region" role="status" aria-live="polite" aria-atomic="true">{toast ? <div className="toast" key={toast.id}><span>{toast.message}</span><button type="button" onClick={() => setToast(null)} aria-label={copy.dismiss}>×</button></div> : null}</div></ToastContext.Provider>;
}
export function ThemeToggle() {
  const [choice, setChoice] = useState("system");
  useEffect(() => { setChoice(document.documentElement.dataset.preference || "system"); const media = matchMedia("(prefers-color-scheme: dark)"); const update = () => { if ((document.documentElement.dataset.preference || "system") === "system") document.documentElement.dataset.theme = media.matches ? "dark" : "light"; }; media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  const options = [{ value: "light", label: copy.light, icon: "sun" }, { value: "dark", label: copy.dark, icon: "moon" }, { value: "system", label: copy.system, icon: "monitor" }] as const;
  return <fieldset className="theme-control"><legend className="sr-only">{copy.theme}</legend>{options.map((option) => <label className="theme-option" key={option.value} title={option.label}><input className="sr-only" type="radio" name="appearance" value={option.value} checked={choice === option.value} onChange={() => { const value = option.value; setChoice(value); document.documentElement.dataset.preference = value; document.documentElement.dataset.theme = value === "system" ? matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : value; try { localStorage.setItem("portfolio-theme", value); } catch {} }} /><span className="theme-icon"><Icon name={option.icon} /></span><span className="sr-only">{option.label}</span></label>)}</fieldset>;
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
