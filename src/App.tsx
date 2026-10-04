import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Stage from "./components/Stage";
import LightPad from "./components/LightPad";
import ShadeFigure from "./components/ShadeFigure";
import TitleScreen from "./components/TitleScreen";
import LevelSelect from "./components/LevelSelect";
import { clampLight, buildLevels, type LevelProgress } from "./game/levels";
import { clamp, lerp, projectPoly, type Light, type Pt } from "./game/geometry";
import { computeMatch } from "./game/scoring";
import { setMuted as setSfxMuted, sfx } from "./game/sound";

const KEY = "shadow-angle-match-v2";
const KEY_STEP = 2.5;
const KEY_STEP_FINE = 10;
const KEY_STEP_Z = 5;

type Progress = Record<string, LevelProgress>;
type Save = { progress: Progress; unlockAll: boolean };

function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Save>;
      return { progress: p.progress ?? {}, unlockAll: !!p.unlockAll };
    }
  } catch {
    /* ignore */
  }
  return { progress: {}, unlockAll: false };
}

function persist(s: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

const GREETINGS = [
  "짠! 벽 속에서 나왔어요.",
  "완벽한 각도예요. 빛을 읽는 눈이시군요.",
  "쉐이드, 그림자로 인사드립니다.",
  "이 각도라면 어디에든 숨을 수 있죠.",
  "빛이 정확히 설 때, 그림자는 진실을 말해요.",
];

export default function App() {
  const levels = useMemo(() => buildLevels(), []);
  const [screen, setScreen] = useState<"title" | "select" | "play">("title");
  const [idx, setIdx] = useState(0);
  const level = levels[idx];
  const spec = level.spec;

  const [light, setLight] = useState<Light>(() => clampLight(spec.start, level));
  const [locked, setLocked] = useState(false);
  const [showGhost, setShowGhost] = useState(true);
  const [showRays, setShowRays] = useState(true);
  const [blur, setBlur] = useState(2.2);
  const [hints, setHints] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState(0);
  const [greeting, setGreeting] = useState(GREETINGS[0]);
  const [save, setSave] = useState<Save>(() => loadSave());
  const progress = save.progress;
  const [mute, setMute] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [touched, setTouched] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => setSfxMuted(mute), [mute]);

  const shadow: Pt[][] = useMemo(
    () => level.pieces.map((p) => projectPoly(p.obj, p.z, light)),
    [level, light],
  );
  // P1-3: getImageData 스로틀 — 100ms 이내 재계산은 이전값 재사용
  const lastMatchRef = useRef({ at: 0, key: "", value: { iou: 0, score: 0 } as ReturnType<typeof computeMatch> });
  const match = useMemo(() => {
    const key = `${light.x.toFixed(2)}|${light.y.toFixed(2)}|${light.z.toFixed(2)}|${level.target.length}`;
    const now = performance.now();
    const last = lastMatchRef.current;
    if (last.key === key) return last.value;
    if (now - last.at < 100 && last.key !== "") return last.value;
    const v = computeMatch(shadow, level.target);
    lastMatchRef.current = { at: now, key, value: v };
    return v;
  }, [shadow, level.target, light]);

  const stopAnim = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const startLevel = useCallback(
    (i: number) => {
      const lv = levels[i];
      stopAnim();
      setIdx(i);
      setLight(clampLight(lv.spec.start, lv));
      setLocked(false);
      setHints(3);
      setElapsed(0);
      setBest(0);
      setShowGhost(true);
      setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
      setScreen("play");
      sfx.ui();
    },
    [levels],
  );

  /* ---------------- 타이머 ---------------- */
  useEffect(() => {
    if (screen !== "play" || locked) return;
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(t);
  }, [screen, locked]);

  /* ---------------- 정답 애니메이션 ---------------- */
  const lightRef = useRef(light);
  useEffect(() => { lightRef.current = light; }, [light]);
  const animateTo = (target: Light, dur = 800) => {
    stopAnim();
    const from = { ...lightRef.current };
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setLight({
        x: lerp(from.x, target.x, e),
        y: lerp(from.y, target.y, e),
        z: lerp(from.z, target.z, e),
      });
      if (k < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  /* ---------------- 성공 처리 ---------------- */
  const rec = progress[spec.id];
  useEffect(() => {
    if (locked || screen !== "play") return;
    if (match.iou > best) setBest(match.iou);
    if (match.iou >= spec.tolerance) {
      setLocked(true);
      setFlashKey((f) => f + 1);
      sfx.solve();
      animateTo(spec.solution, 850);
      const usedHints = 3 - hints;
      setSave((cur) => {
        const prevRec = cur.progress[spec.id];
        const next: Save = {
          ...cur,
          progress: {
            ...cur.progress,
            [spec.id]: {
              solved: true,
              best: Math.max(prevRec?.best ?? 0, match.iou),
              time: prevRec?.solved ? prevRec.time : elapsed,
              hints: prevRec?.solved ? Math.min(prevRec.hints, usedHints) : usedHints,
            },
          },
        };
        persist(next);
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.iou, locked, screen]);

  useEffect(() => () => stopAnim(), []);

  /* ---------------- 키보드 ---------------- */
  useEffect(() => {
    if (screen !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (locked) return;
      const s = e.shiftKey ? KEY_STEP_FINE : KEY_STEP;
      let dx = 0;
      let dy = 0;
      let dz = 0;
      switch (e.key) {
        case "ArrowLeft":
          dx = -s;
          break;
        case "ArrowRight":
          dx = s;
          break;
        case "ArrowUp":
          dy = -s;
          break;
        case "ArrowDown":
          dy = s;
          break;
        case "w":
        case "W":
          dz = KEY_STEP_Z;
          break;
        case "s":
        case "S":
          dz = -KEY_STEP_Z;
          break;
        default:
          return;
      }
      e.preventDefault();
      setLight((l) => clampLight({ x: l.x + dx, y: l.y + dy, z: l.z + dz }, level));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, locked, level]);

  const changeLight = useCallback(
    (l: Light) => {
      setTouched(true);
      setLight(() => clampLight(l, level));
    },
    [level],
  );

  const useHint = () => {
    if (hints <= 0 || locked) return;
    setHints((h) => h - 1);
    sfx.hint();
    const k = [0.42, 0.62, 0.88][Math.min(2, Math.max(0, hints - 1))];
    setLight((l) =>
      clampLight(
        {
          x: lerp(l.x, spec.solution.x, k),
          y: lerp(l.y, spec.solution.y, k),
          z: lerp(l.z, spec.solution.z, k),
        },
        level,
      ),
    );
    setShowGhost(true);
  };

  const solvedCount = levels.filter((l) => progress[l.spec.id]?.solved).length;
  const isLast = idx === levels.length - 1;
  const pct = Math.round(match.iou * 100);
  const goal = Math.round(spec.tolerance * 100);
  const starCount = !locked
    ? 0
    : 1 + (3 - hints <= 1 ? 1 : 0) + (hints === 3 && elapsed <= 75 ? 1 : 0);

  if (screen === "title")
    return (
      <TitleScreen
        onStart={() => {
          const next = levels.findIndex((l) => !progress[l.spec.id]?.solved);
          startLevel(next < 0 ? 0 : next);
        }}
        onSelect={() => {
          setScreen("select");
          sfx.ui();
        }}
        solvedCount={solvedCount}
        total={levels.length}
      />
    );

  if (screen === "select")
    return (
      <LevelSelect
        levels={levels}
        progress={progress}
        unlockAll={save.unlockAll}
        onPick={startLevel}
        onBack={() => setScreen("title")}
        onUnlockAll={() =>
          setSave((cur) => {
            const next = { ...cur, unlockAll: true };
            persist(next);
            return next;
          })
        }
      />
    );

  return (
    <div className="min-h-screen bg-[#070910] text-slate-200">
      <div className="pointer-events-none fixed -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-amber-300/[0.07] blur-[110px]" />
      <div className="relative mx-auto max-w-7xl px-3 py-4 sm:px-5 lg:py-6">
        {/* 헤더 */}
        <header className="mb-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setScreen("title")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-slate-300 transition hover:border-amber-300/40 hover:text-amber-200"
          >
            ← 나가기
          </button>
          <button
            onClick={() => setScreen("select")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-slate-300 transition hover:border-amber-300/40 hover:text-amber-200"
          >
            📖 도감
          </button>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="text-2xl">{spec.emoji}</span>
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold leading-tight text-white">
                {spec.name}
              </div>
              <div className="font-mono text-[10px] text-slate-500">
                {spec.category} · #{String(idx + 1).padStart(3, "0")}/{levels.length}
                {rec?.solved && <span className="ml-1.5 text-emerald-400">· 완성됨</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => idx > 0 && startLevel(idx - 1)}
              disabled={idx === 0}
              className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[13px] text-slate-300 transition enabled:hover:border-amber-300/40 enabled:hover:text-amber-200 disabled:opacity-30"
              title="이전 그림자"
            >
              ◀
            </button>
            <button
              onClick={() => idx < levels.length - 1 && startLevel(idx + 1)}
              disabled={idx === levels.length - 1}
              className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[13px] text-slate-300 transition enabled:hover:border-amber-300/40 enabled:hover:text-amber-200 disabled:opacity-30"
              title="다음 그림자"
            >
              ▶
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-[12px] text-slate-300">
              ⏱ {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
              {String(elapsed % 60).padStart(2, "0")}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-[12px] text-amber-200">
              💡 힌트 {hints}
            </div>
            <button
              onClick={() => setMute((m) => !m)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-slate-300 transition hover:text-amber-200"
              title="소리"
            >
              {mute ? "🔇" : "🔊"}
            </button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* 스테이지 */}
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
              <div className="aspect-[3/2] w-full">
                <Stage
                  key={`${spec.id}-${flashKey}`}
                  level={level}
                  light={light}
                  shadow={shadow}
                  onChange={changeLight}
                  locked={locked}
                  showGhost={showGhost}
                  showRays={showRays}
                  blur={blur}
                  solved={locked}
                />
              </div>

              {!locked && (
                <>
                  <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur">
                    <span className="text-[9.5px] font-bold tracking-[0.15em] text-slate-300">
                      일치도
                    </span>
                    <span
                      className={`font-mono text-[17px] font-black leading-none ${
                        pct >= goal
                          ? "text-emerald-300"
                          : pct >= goal - 18
                            ? "text-amber-300"
                            : "text-rose-300"
                      }`}
                    >
                      {pct}%
                    </span>
                    <span className="text-[9.5px] text-emerald-300/70">/ {goal}%</span>
                  </div>
                  {!touched && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
                      <div className="pulse-glow rounded-full border border-amber-200/30 bg-black/60 px-4 py-2 text-center text-[11.5px] font-semibold text-amber-100 backdrop-blur">
                        💡 화면을 드래그해 <b className="text-white">조명</b>을 움직이세요 — 물체는
                        고정입니다
                      </div>
                    </div>
                  )}
                </>
              )}

              {locked && (
                <>
                  <div className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2">
                    <div className="rise-in rounded-full border border-emerald-300/40 bg-emerald-400/15 px-5 py-2 text-[15px] font-black tracking-widest text-emerald-200 backdrop-blur">
                      ✓ 완벽 일치 · {pct}%
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4 sm:p-6">
                    <div className="pop-out relative">
                      <ShadeFigure size={130} />
                    </div>
                    <div className="rise-in flex-1 pb-1">
                      <div className="max-w-sm rounded-2xl rounded-br-sm border border-white/10 bg-[#111726]/90 px-4 py-3 text-[12.5px] leading-relaxed text-slate-200 shadow-xl backdrop-blur">
                        <span className="mr-1.5 text-[15px]">🥷</span>
                        {greeting}
                        <div className="mt-2 flex items-center gap-2 text-[12px] text-amber-300">
                          {[0, 1, 2].map((s) => (
                            <span key={s} className={s < starCount ? "" : "opacity-25"}>
                              ★
                            </span>
                          ))}
                          <span className="ml-1 font-mono text-[11px] text-slate-400">
                            {elapsed}초 · 힌트 {3 - hints}회
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        onClick={() => {
                          const text = `[그림자 각도 맞추기] ${spec.name} 완성 · 일치도 ${pct}% · ${elapsed}초 · 힌트 ${3 - hints}회 #그림자맞추기`;
                          const nav = navigator as Navigator & { share?: (d: { title: string; text: string }) => Promise<void> };
                          if (typeof nav.share === "function") {
                            nav.share({ title: "그림자 각도 맞추기", text }).catch(() => { /* dismissed */ });
                          } else {
                            navigator.clipboard?.writeText(text).catch(() => { /* noop */ });
                          }
                        }}
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-slate-200 transition hover:scale-105 hover:text-white"
                      >
                        기록 공유
                      </button>
                      {!isLast ? (
                        <button
                          onClick={() => startLevel(idx + 1)}
                          className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-2.5 text-[13px] font-bold text-amber-950 shadow-lg transition hover:scale-105"
                        >
                          다음 그림자 →
                        </button>
                      ) : (
                        <button
                          onClick={() => setScreen("select")}
                          className="rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-500 px-4 py-2.5 text-[13px] font-bold text-emerald-950 shadow-lg transition hover:scale-105"
                        >
                          🎉 도감으로
                        </button>
                      )}
                      <button
                        onClick={() => startLevel(idx)}
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[12px] font-semibold text-slate-300 transition hover:bg-white/10"
                      >
                        다시 도전
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-slate-500">
              <span>
                <b className="text-slate-300">드래그</b> = 조명 이동
              </span>
              <span>
                <b className="text-slate-300">방향키</b> = 정밀 조정 (Shift ×4)
              </span>
              <span>
                <b className="text-slate-300">휠 / W·S</b> = 깊이
              </span>
            </div>
          </div>

          {/* 컨트롤 패널 */}
          <aside className="space-y-4">
            {/* 일치도 */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] font-bold tracking-widest text-slate-400">
                    그림자 일치도
                  </div>
                  <div
                    className={`font-mono text-4xl font-black leading-none ${
                      pct >= goal
                        ? "text-emerald-300"
                        : pct >= goal - 18
                          ? "text-amber-300"
                          : "text-rose-300"
                    }`}
                  >
                    {pct}
                    <span className="text-lg">%</span>
                  </div>
                </div>
                <div className="text-right text-[10.5px] leading-tight text-slate-500">
                  최고 기록
                  <div className="font-mono text-[13px] text-slate-300">
                    {Math.round(Math.max(best, rec?.best ?? 0) * 100)}%
                  </div>
                </div>
              </div>
              <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-[width] duration-150"
                  style={{
                    width: `${clamp(pct, 0, 100)}%`,
                    background:
                      pct >= goal
                        ? "linear-gradient(90deg,#34d399,#a7f3d0)"
                        : "linear-gradient(90deg,#f472b6,#fbbf24,#fde68a)",
                  }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-emerald-300/90"
                  style={{ left: `${goal}%` }}
                />
              </div>
              <div className="mt-1.5 text-[10.5px] text-slate-500">
                목표선 <b className="text-emerald-300">{goal}%</b> 이상이면 그림자가 깨어납니다.
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
              <LightPad level={level} light={light} onChange={changeLight} locked={locked} />

              <div className="mt-4">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[11px] font-bold tracking-widest text-amber-200/70">
                    그림자 부드러움 (반음영)
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {blur.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  step={0.2}
                  value={blur}
                  disabled={locked}
                  onChange={(e) => setBlur(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Toggle
                  on={showGhost}
                  onClick={() => setShowGhost((v) => !v)}
                  label="목표 실루엣"
                  icon="🎯"
                />
                <Toggle
                  on={showRays}
                  onClick={() => setShowRays((v) => !v)}
                  label="빛의 경로"
                  icon="🔆"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={useHint}
                  disabled={hints <= 0 || locked}
                  className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2.5 text-[12px] font-bold text-amber-200 transition enabled:hover:bg-amber-300/20 disabled:opacity-35"
                >
                  💡 힌트 ({hints})
                </button>
                <button
                  onClick={() => startLevel(idx)}
                  disabled={locked}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[12px] font-semibold text-slate-300 transition enabled:hover:bg-white/10 disabled:opacity-35"
                >
                  ↺ 처음부터
                </button>
              </div>
            </div>

            {/* 쉐이드의 조언 */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
              <div className="flex gap-3">
                <div className="shrink-0 pt-1">
                  <ShadeFigure size={44} wings={false} />
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-widest text-amber-200/70">
                    쉐이드의 조언
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-300">{spec.advice}</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                    조각은 총{" "}
                    <b className="text-sky-300">{level.pieces.length}장</b> · 가장 앞 조각 z=
                    {level.minZ} · 벽 z=100
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  on,
  onClick,
  label,
  icon,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-1.5 rounded-xl border px-3 py-2 text-[11.5px] font-semibold transition ${
        on
          ? "border-sky-300/40 bg-sky-400/15 text-sky-200"
          : "border-white/10 bg-white/[0.03] text-slate-500"
      }`}
    >
      <span className="truncate">
        {icon} {label}
      </span>
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          on ? "bg-sky-300 shadow-[0_0_8px_#7dd3fc]" : "bg-slate-600"
        }`}
      />
    </button>
  );
}
