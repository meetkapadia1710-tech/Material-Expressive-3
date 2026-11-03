/**
 * Ultra-fast, reliable clipboard utility with optimistic execution and resilient fallback.
 * Solves browser IPC and permission latency by running synchronous execCommand within
 * the user gesture event loop while concurrently calling navigator.clipboard.writeText.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // 1. Fast-path: Synchronous fallback via textarea execCommand (0ms response in user gesture)
  let execSuccess = false;
  try {
    const textarea = document.createElement("textarea");
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
    document.body.removeChild(textarea);
  } catch {
    execSuccess = false;
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

