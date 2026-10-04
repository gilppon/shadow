/** 아주 작은 WebAudio 효과음 모듈 (파일 없이 합성) */
let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(v: boolean) {
  muted = v;
}
export function isMuted() {
  return muted;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function closeSfx(): void {
  if (ctx) {
    void ctx.close().catch(() => undefined);
    ctx = null;
  }
}
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) closeSfx();
  });
}

function tone(
  freq: number,
  dur: number,
  when = 0,
  type: OscillatorType = "sine",
  gain = 0.06,
) {
  const a = ac();
  if (!a || muted) return;
  const t0 = a.currentTime + when;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  grab: () => tone(320, 0.07, 0, "triangle", 0.03),
  move: () => tone(520, 0.03, 0, "sine", 0.012),
  hint: () => {
    tone(660, 0.12, 0, "triangle", 0.05);
    tone(990, 0.16, 0.08, "triangle", 0.04);
  },
  fail: () => tone(140, 0.18, 0, "sawtooth", 0.03),
  solve: () => {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => tone(f, 0.5, i * 0.09, "sine", 0.07));
    notes.forEach((f, i) => tone(f * 2, 0.3, i * 0.09 + 0.02, "triangle", 0.02));
  },
  ui: () => tone(440, 0.05, 0, "square", 0.02),
};
