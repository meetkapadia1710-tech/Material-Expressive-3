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
import { RouteTransitionContent } from "@/components/motion/route-transition-content";
import { IntroLoader } from "@/components/motion/intro-loader";

const displayFont = localFont({ src: "../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2", variable: "--font-display-local", display: "swap", weight: "200 800" });
const bodyFont = localFont({ src: "../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2", variable: "--font-body-local", display: "swap", weight: "100 1000" });
const themeBootstrapScript = `(function(){var r=document.documentElement;var key="portfolio-color-palette";var roles=["primary","on-primary","primary-container","on-primary-container","secondary","on-secondary","secondary-container","on-secondary-container","tertiary","on-tertiary","tertiary-container","on-tertiary-container","error","on-error","error-container","on-error-container","background","on-background","surface","on-surface","surface-variant","on-surface-variant","surface-container-lowest","surface-container-low","surface-container","surface-container-high","surface-container-highest","surface-dim","surface-bright","outline","outline-variant","inverse-surface","inverse-on-surface","inverse-primary","surface-tint","shadow","scrim"];try{var p=localStorage.getItem("portfolio-theme");if(!["light","dark","system"].includes(p))p="system";r.dataset.preference=p;r.dataset.theme=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p}catch(e){r.dataset.theme=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}r.dataset.colorPalette="default";try{var c=JSON.parse(localStorage.getItem(key)||"null");var m=r.dataset.theme==="dark"?"dark":"light";var x=c&&c[m];var validRecord=c&&/^#[0-9a-f]{6}$/i.test(c.seed)&&(!c.mode||c.mode==="seed")&&x&&roles.every(function(k){return /^#[0-9a-f]{6}$/i.test(x[k]||"")});if(c&&c.mode==="default"){r.dataset.colorPalette="default";delete r.dataset.colorSeed;delete r.dataset.colorSource}else if(validRecord){roles.forEach(function(k){r.style.setProperty("--color-"+k,x[k])});r.style.setProperty("--color-seed",c.seed.toUpperCase());r.dataset.colorSeed=c.seed.toUpperCase();r.dataset.colorSource="user";r.dataset.colorPalette="seed"}else if(c){localStorage.removeItem(key);localStorage.removeItem("portfolio-color-seed")}}catch(e){try{localStorage.removeItem(key)}catch(_){}}})();`;
const introGateScript = `(function(){try{var ua=navigator.userAgent||"";if(/bot|crawler|spider|slurp|facebookexternalhit|twitterbot/i.test(ua))return;try{sessionStorage.removeItem("meet-portfolio-intro-seen-v1");sessionStorage.removeItem("meet-portfolio-intro-seen-v2")}catch(_){}if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var root=document.documentElement;root.dataset.introPending="true";root.dataset.introStarted=String(Date.now());document.addEventListener("DOMContentLoaded",function(){if(root.dataset.introPending==="true"){var main=document.getElementById("main-content");if(main)main.setAttribute("aria-busy","true")}});window.setTimeout(function(){if(root.dataset.introPending==="true"&&root.dataset.introExiting!=="true"){root.dataset.introFast="true";root.dataset.introExiting="true"}},5000);window.setTimeout(function(){if(root.dataset.introPending==="true"){delete root.dataset.introPending;delete root.dataset.introExiting;delete root.dataset.introFast;delete root.dataset.introStarted;var main=document.getElementById("main-content");if(main){main.removeAttribute("aria-busy");main.focus({preventScroll:true})}}},5200)}catch(e){}})();`;

export const metadata: Metadata = { title: { default: siteCopy.metadata.title, template: `%s · ${siteCopy.metadata.title}` }, description: siteCopy.metadata.description };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html suppressHydrationWarning lang="en" data-color-palette="default" className={`${displayFont.variable} ${bodyFont.variable}`}>
    <head>
      <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      <script dangerouslySetInnerHTML={{ __html: introGateScript }} />
    </head>
    <body suppressHydrationWarning><ProjectTransitionGroup><ToastProvider><MotionRuntime /><IntroLoader /><a href="#main-content" className="skip-link">{siteCopy.skipLink}</a><div className="site-shell"><SiteNavigation /><main id="main-content" tabIndex={-1} suppressHydrationWarning><RouteTransitionContent>{children}</RouteTransitionContent></main><SiteFooter /></div></ToastProvider></ProjectTransitionGroup></body>
  </html>;
}
