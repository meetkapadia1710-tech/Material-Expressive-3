export type ViewTransitionHandle = {
  skipTransition: () => void;
  finished: Promise<void>;
  ready?: Promise<void>;
  updateCallbackDone?: Promise<void>;
};
type ActiveTransition = { handle: ViewTransitionHandle; kind: "route" | "theme"; onSkip?: () => void };

let activeTransition: ActiveTransition | null = null;

export function skipActiveViewTransition() {
  const current = activeTransition;
  if (!current) return;
  activeTransition = null;
  try {
    current.handle.skipTransition();
  } catch {
    // Already skipped or finished
  }
  current.onSkip?.();
}

export function registerViewTransition(kind: ActiveTransition["kind"], handle: ViewTransitionHandle, onSkip?: () => void) {
  void handle.ready?.catch(() => {});
  void handle.updateCallbackDone?.catch(() => {});
  void handle.finished.catch(() => {});
  const current: ActiveTransition = { handle, kind, onSkip };
  activeTransition = current;
  void handle.finished.catch(() => {}).finally(() => {
    if (activeTransition === current) activeTransition = null;
  });
}
