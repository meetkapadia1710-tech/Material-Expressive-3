export interface PointerSample { x: number; y: number; width: number; height: number }
type Subscriber = (sample: PointerSample | null, immediate: boolean) => void;
export interface PointerEnvironment {
  view: Window;
  document: Document;
  observe: (callback: (element: Element, visible: boolean) => void) => { observe(element: Element): void; unobserve(element: Element): void; disconnect(): void };
  schedule(callback: () => void): void;
  cancel(callback: () => void): void;
}

/** One passive pointer listener and one queued frame for every subscriber. */
export function createPointerTracker(env: PointerEnvironment) {
  const fine = env.view.matchMedia("(pointer: fine) and (hover: hover)");
  const reduced = env.view.matchMedia("(prefers-reduced-motion: reduce)");
  const subscribers = new Map<Element, { callback: Subscriber; visible: boolean; active: boolean }>();
  let enabled = false;
  let queued = false;
  let position: { x: number; y: number } | null = null;
  const reset = (immediate = false) => {
    env.cancel(flush); queued = false; position = null;
    subscribers.forEach((subscriber) => { if (subscriber.active) subscriber.callback(null, immediate); subscriber.active = false; });
  };
  const flush = () => {
    queued = false;
    if (!enabled || !position) return;
    // Batch all geometry reads before subscriber callbacks write styles.
    const updates: { subscriber: { callback: Subscriber; visible: boolean; active: boolean }; sample: PointerSample | null }[] = [];
    subscribers.forEach((subscriber, element) => {
      if (!subscriber.visible || !element.isConnected) return;
      const rect = element.getBoundingClientRect();
      const x = position!.x - rect.left, y = position!.y - rect.top;
      const inside = rect.width > 0 && rect.height > 0 && x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      updates.push({ subscriber, sample: inside ? { x, y, width: rect.width, height: rect.height } : null });
    });
    updates.forEach(({ subscriber, sample }) => {
      if (sample || subscriber.active) subscriber.callback(sample, false);
      subscriber.active = sample !== null;
    });
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") { reset(true); return; }
    if (![...subscribers.values()].some((subscriber) => subscriber.visible)) return;
    position = { x: event.clientX, y: event.clientY };
    if (!queued) { queued = true; env.schedule(flush); }
  };
  const leave = (event: PointerEvent) => { if (!event.relatedTarget) reset(); };
  const keyboard = (event: KeyboardEvent) => { if (event.key === "Tab") reset(true); };
  const blur = () => reset(true);
  const scroll = () => reset();
  const observer = env.observe((element, visible) => {
    const subscriber = subscribers.get(element);
    if (!subscriber) return;
    subscriber.visible = visible;
    if (!visible && subscriber.active) { subscriber.callback(null, true); subscriber.active = false; }
  });
  const sync = () => {
    const next = fine.matches && !reduced.matches && !env.document.hidden && subscribers.size > 0;
    if (next === enabled) return;
    enabled = next;
    if (enabled) {
      env.view.addEventListener("pointermove", move, { passive: true });
      env.view.addEventListener("pointerout", leave, { passive: true });
      env.view.addEventListener("keydown", keyboard);
      env.view.addEventListener("blur", blur);
      env.view.addEventListener("scroll", scroll, { passive: true });
    } else {
      env.view.removeEventListener("pointermove", move);
      env.view.removeEventListener("pointerout", leave);
      env.view.removeEventListener("keydown", keyboard);
      env.view.removeEventListener("blur", blur);
      env.view.removeEventListener("scroll", scroll);
      reset(true);
    }
  };
  fine.addEventListener("change", sync); reduced.addEventListener("change", sync);
  env.document.addEventListener("visibilitychange", sync);
  return {
    subscribe(element: Element, callback: Subscriber) {
      subscribers.set(element, { callback, visible: false, active: false });
      observer.observe(element); sync();
      return () => { observer.unobserve(element); callback(null, true); subscribers.delete(element); sync(); };
    },
    destroy() {
      subscribers.forEach((subscriber) => subscriber.callback(null, true)); subscribers.clear(); sync(); observer.disconnect();
      fine.removeEventListener("change", sync); reduced.removeEventListener("change", sync);
      env.document.removeEventListener("visibilitychange", sync);
    },
  };
}
