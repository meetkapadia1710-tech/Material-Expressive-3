"use client";

import { useEffect } from "react";

const DEV_SW_CLEANUP_KEY = "meet-portfolio:sw-dev-cleaned";

export function SwRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      let active = true;
      void (async () => {
        try {
          const hadController = Boolean(navigator.serviceWorker.controller);
          const registrations = await navigator.serviceWorker.getRegistrations();
          const unregistered = (
            await Promise.all(registrations.map((registration) => registration.unregister()))
          ).some(Boolean);

          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(
              keys.filter((key) => key.startsWith("portfolio-")).map((key) => caches.delete(key)),
            );
          }

          if (!active) return;

          if ((hadController || unregistered) && !sessionStorage.getItem(DEV_SW_CLEANUP_KEY)) {
            sessionStorage.setItem(DEV_SW_CLEANUP_KEY, "1");
            window.location.reload();
          }
        } catch {
          // Ignore service-worker or storage restrictions in private contexts.
        }
      })();
      return () => {
        active = false;
      };
    }

    const register = () => {
      try {
        sessionStorage.removeItem(DEV_SW_CLEANUP_KEY);
      } catch {
        // Ignore sessionStorage restrictions.
      }
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Non-blocking: browsers or restrictive contexts that disallow SW fall back to localStorage.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}

