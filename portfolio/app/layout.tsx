import type { Metadata } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/manrope";
import "@fontsource-variable/dm-sans";
import "./globals.css";
import { SiteNavigation } from "@/components/site-navigation";
import { SiteFooter } from "@/components/site-footer";
import { siteCopy } from "@/content/profile";
import { ToastProvider } from "@/components/interface-controls";
import { MotionRuntime } from "@/components/motion/motion-runtime";
import { ProjectTransitionGroup } from "@/components/motion/shared-project-element";

const displayFont = localFont({ src: "../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2", variable: "--font-display-local", display: "swap", weight: "200 800" });
const bodyFont = localFont({ src: "../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2", variable: "--font-body-local", display: "swap", weight: "100 1000" });

export const metadata: Metadata = { title: { default: siteCopy.metadata.title, template: `%s · ${siteCopy.metadata.title}` }, description: siteCopy.metadata.description };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html suppressHydrationWarning lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}><head><script dangerouslySetInnerHTML={{ __html: `(function(){var r=document.documentElement;try{var p=localStorage.getItem("portfolio-theme");if(!["light","dark","system"].includes(p))p="system";r.dataset.preference=p;r.dataset.theme=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p}catch(e){r.dataset.theme=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}try{var c=JSON.parse(localStorage.getItem("portfolio-color-palette")||"null");var mode=r.dataset.theme==="dark"?"dark":"light";var colors=c&&c[mode];if(c&&/^#[0-9a-f]{6}$/i.test(c.seed)&&colors&&typeof colors==="object"){Object.keys(colors).forEach(function(k){if(/^(?:[a-z]+(?:-[a-z]+)*|--palette-[0-9a-f]{6})$/i.test(k)&&/^#[0-9a-f]{6}$/i.test(colors[k]))r.style.setProperty(k.indexOf("--")===0?k:"--color-"+k,colors[k])});r.dataset.colorSeed=c.seed}}catch(e){}})();` }} /></head><body><ProjectTransitionGroup><ToastProvider><MotionRuntime /><a href="#main-content" className="skip-link">{siteCopy.skipLink}</a><div className="site-shell"><SiteNavigation /><main id="main-content">{children}</main><SiteFooter /></div></ToastProvider></ProjectTransitionGroup></body></html>;
}
