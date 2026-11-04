/**
 * Try the legacy copy command within the user gesture and report the result
 * of either clipboard path.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // 1. Fast-path: Synchronous fallback via textarea execCommand (0ms response in user gesture)
  let execSuccess = false;
  const previousFocus = document.activeElement;
  const textarea = document.createElement("textarea");
  try {
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    textarea.setAttribute("readonly", "");
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    execSuccess = document.execCommand("copy");
  } catch {
    execSuccess = false;
  } finally {
    const restoreFocus = document.activeElement === textarea;
    textarea.remove();
    if (restoreFocus && previousFocus instanceof HTMLElement && previousFocus.isConnected) {
      previousFocus.focus({ preventScroll: true });
    }
  }

  // 2. Modern Clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return execSuccess;
    }
  }

  return execSuccess;
}

