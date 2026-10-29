type ViewTransitionHandle = { skipTransition: () => void; finished: Promise<void> };
type ActiveTransition = { handle: ViewTransitionHandle; kind: "route" | "theme"; onSkip?: () => void };

let activeTransition: ActiveTransition | null = null;

export function skipActiveViewTransition() {
  const current = activeTransition;
  if (!current) return;
  activeTransition = null;
  current.handle.skipTransition();
  current.onSkip?.();
}

export function registerViewTransition(kind: ActiveTransition["kind"], handle: ViewTransitionHandle, onSkip?: () => void) {
  const current: ActiveTransition = { handle, kind, onSkip };
  activeTransition = current;
  void handle.finished.catch(() => {}).finally(() => {
    if (activeTransition === current) activeTransition = null;
  });
}
