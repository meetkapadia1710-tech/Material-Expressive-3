"use client";

let audioCtx: AudioContext | null = null;
let lastSoundTime = 0;
const MIN_SOUND_INTERVAL = 45; // ms rate limiting

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();

    // Auto-suspend when document is hidden to conserve resources
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && audioCtx && audioCtx.state === "running") {
        void audioCtx.suspend();
      } else if (!document.hidden && audioCtx && audioCtx.state === "suspended") {
        void audioCtx.resume();
      }
    });
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

export type SoundKind = "click" | "tick" | "toggle";

export function playTactileSound(kind: SoundKind) {
  if (typeof window === "undefined") return;

  // Verify user has enabled sound in preferences
  try {
    const enabled = localStorage.getItem("portfolio-sound-enabled") === "true";
    if (!enabled) return;
  } catch {
    return;
  }

  // Rate limit triggers
  const now = performance.now();
  if (now - lastSoundTime < MIN_SOUND_INTERVAL) return;
  lastSoundTime = now;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const masterGain = ctx.createGain();
    // Keep volume low: 10% to 14% of full scale
    masterGain.gain.setValueAtTime(0.12, t);
    masterGain.connect(ctx.destination);

    if (kind === "click") {
      // Short, soft button click (~35ms) with smooth exponential decay envelope
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.035);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(1, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.04);
    } else if (kind === "tick") {
      // Subtle high-pitch navigation tick (~20ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.02);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.8, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.025);
    } else if (kind === "toggle") {
      // Soft melodic two-tone frequency toggle (~65ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.setValueAtTime(540, t + 0.03);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(1, t + 0.004);
      gain.gain.setValueAtTime(0.7, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.07);
    }
  } catch {
    // Audio context initialization or playback failure ignored gracefully
  }
}

