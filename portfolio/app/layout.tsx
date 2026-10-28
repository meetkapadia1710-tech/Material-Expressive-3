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

const displayFont = localFont({ src: "../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2", variable: "--font-display-local", display: "swap", weight: "200 800" });
const bodyFont = localFont({ src: "../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2", variable: "--font-body-local", display: "swap", weight: "100 1000" });

export const metadata: Metadata = { title: { default: siteCopy.metadata.title, template: `%s · ${siteCopy.metadata.title}` }, description: siteCopy.metadata.description };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html suppressHydrationWarning lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}><head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var p=localStorage.getItem("portfolio-theme");if(!["light","dark","system"].includes(p))p="system";document.documentElement.dataset.preference=p;document.documentElement.dataset.theme=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p}catch(e){document.documentElement.dataset.theme=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}})();` }} /></head><body><ToastProvider><MotionRuntime /><a href="#main-content" className="skip-link">{siteCopy.skipLink}</a><div className="site-shell"><SiteNavigation /><main id="main-content">{children}</main><SiteFooter /></div></ToastProvider></body></html>;
}
