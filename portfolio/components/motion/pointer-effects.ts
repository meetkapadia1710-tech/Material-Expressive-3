import { frame, cancelFrame } from "framer-motion";
import { createPointerTracker } from "@/lib/pointer-tracker";

/** DOM subscriptions preserve server-rendered content and do not render React on movement. */
export function mountPointerEffects() {
  const tracker = createPointerTracker({
    view: window, document,
    schedule: (callback) => { frame.update(callback); },
    cancel: (callback) => cancelFrame(callback),
    observe: (callback) => { const observer = new IntersectionObserver((entries) => entries.forEach((entry) => callback(entry.target, entry.isIntersecting))); return observer; },
  });
  const registrations = new Map<HTMLElement, () => void>();
  const selector = ".project-card, [data-project-slug]:not(.expandable-dialog), .skill-modal-project-card, .about-education-card, .button-primary, .button-secondary, .button-dark, .nav-link, .hero-art, .cardExpandButton, .expandable-dialog-close, .expandable-more-toggle, .craftsmanship-toggle-button, .craftsmanship-copy-button, .craftsmanship-tab, .skill-modal-close, .skill-modal-details-link, .skill-modal-repo-link, .skills-mode-pill, .skills-cat-pill";
  function register(element: HTMLElement) {
    if (registrations.has(element)) return;
    const kind = element.matches(".hero-art")
      ? "hero"
      : element.matches(".project-card, [data-project-slug]:not(.expandable-dialog), .skill-modal-project-card, .about-education-card")
      ? "card"
      : "magnetic";
    element.dataset.pointerEffect = kind;
    const unsubscribe = tracker.subscribe(element, (sample, immediate) => {
      element.toggleAttribute("data-pointer-reset", immediate);
      if (!sample || element.matches(":focus-visible") || element.querySelector(":focus-visible")) {
        element.removeAttribute("data-pointer-active");
        if (kind !== "card" || immediate) { element.style.removeProperty("--pointer-x"); element.style.removeProperty("--pointer-y"); }
        return;
      }
      const x = kind === "card" ? sample.x : (sample.x / sample.width - 0.5) * (kind === "hero" ? 12 : 6);
      const y = kind === "card" ? sample.y : (sample.y / sample.height - 0.5) * (kind === "hero" ? 12 : 6);
      element.style.setProperty("--pointer-x", `${x.toFixed(2)}px`);
      element.style.setProperty("--pointer-y", `${y.toFixed(2)}px`);
      element.setAttribute("data-pointer-active", "");
    });
    registrations.set(element, () => { unsubscribe(); delete element.dataset.pointerEffect; element.removeAttribute("data-pointer-reset"); });
  }
  const scan = (root: ParentNode) => root.querySelectorAll<HTMLElement>(selector).forEach(register);
  scan(document);
  const addedNodesQueue: Node[] = [];
  let updateScheduled = false;
  const mutations = new MutationObserver((records) => {
    for (const record of records) {
      for (let i = 0; i < record.addedNodes.length; i++) {
        addedNodesQueue.push(record.addedNodes[i]);
      }
    }
    if (updateScheduled) return;
    updateScheduled = true;
    requestAnimationFrame(() => {
      updateScheduled = false;
      registrations.forEach((dispose, element) => {
        if (!element.isConnected) {
          dispose();
          registrations.delete(element);
        }
      });
      const nodes = addedNodesQueue.splice(0, addedNodesQueue.length);
      for (const node of nodes) {
        if (node instanceof HTMLElement) {
          if (node.matches(selector)) register(node);
          node.querySelectorAll<HTMLElement>(selector).forEach(register);
        }
      }
    });
  });
  mutations.observe(document.body, { childList: true, subtree: true });
  return () => { mutations.disconnect(); registrations.forEach((dispose) => dispose()); registrations.clear(); tracker.destroy(); };
}
