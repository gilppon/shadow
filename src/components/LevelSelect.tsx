import { useMemo, useState } from "react";
import type { Level, LevelProgress } from "../game/levels";
import { CATEGORIES, CATEGORY_ICON, type Category } from "../game/catalog";

type Props = {
  levels: Level[];
  progress: Record<string, LevelProgress>;
  unlockAll: boolean;
  onPick: (i: number) => void;
  onBack: () => void;
  onUnlockAll: () => void;
};

function stars(p?: LevelProgress) {
  if (!p?.solved) return 0;
  let s = 1;
  if (p.hints <= 1) s++;
  if (p.hints === 0 && p.time <= 75) s++;
  return s;
}

export default function LevelSelect({
  levels,
  progress,
  unlockAll,
  onPick,
  onBack,
  onUnlockAll,
}: Props) {
  const [cat, setCat] = useState<Category | "전체">("전체");

  const stats = useMemo(() => {
    const byCat = new Map<string, { total: number; solved: number }>();
    let solved = 0;
    levels.forEach((l) => {
      const c = l.spec.category;
      const cur = byCat.get(c) ?? { total: 0, solved: 0 };
      cur.total++;
      if (progress[l.spec.id]?.solved) {
        cur.solved++;
        solved++;
      }
      byCat.set(c, cur);
    });
    return { byCat, solved };
  }, [levels, progress]);

  const unlocked = (i: number) =>
    unlockAll || i < 12 || (i > 0 && !!progress[levels[i - 1]?.spec.id]?.solved);

  const list = levels
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => cat === "전체" || l.spec.category === cat);

  return (
    <div className="min-h-screen bg-[#070910] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <button
              onClick={onBack}
              className="mb-3 text-[12px] font-semibold text-slate-400 transition hover:text-amber-200"
            >
              ← 첫 화면
            </button>
            <h2 className="text-3xl font-black tracking-tight text-white">그림자 도감</h2>
            <p className="mt-1.5 text-[13px] text-slate-400">
              총 <b className="text-slate-200">{levels.length}</b>개의 실루엣. 빛의 각도를 맞춰
              벽에 새겨 넣으세요.
            </p>
          </div>
          <div className="min-w-[190px]">
            <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
              <span className="font-bold tracking-widest text-amber-200/70">완성</span>
              <span className="font-mono text-slate-300">
                {stats.solved}/{levels.length}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-[width]"
                style={{ width: `${(stats.solved / levels.length) * 100}%` }}
              />
            </div>
            {!unlockAll && (
              <button
                onClick={onUnlockAll}
                className="mt-2.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11.5px] font-semibold text-slate-300 transition hover:border-amber-300/40 hover:text-amber-200"
              >
                🔓 탐험 모드 (모든 그림자 열기)
              </button>
            )}
          </div>
        </div>

        {/* 카테고리 */}
        <div className="mb-5 flex flex-wrap gap-2">
          {(["전체", ...CATEGORIES] as const).map((c) => {
            const on = cat === c;
            const n =
              c === "전체"
                ? levels.length
                : (stats.byCat.get(c)?.total ?? 0);
            const sd =
              c === "전체" ? stats.solved : (stats.byCat.get(c)?.solved ?? 0);
            return (
              <button
                key={c}
                onClick={() => setCat(c as Category | "전체")}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition ${
                  on
                    ? "border-amber-300/50 bg-amber-300/15 text-amber-100"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200"
                }`}
              >
                {c === "전체" ? "🌌" : CATEGORY_ICON[c as Category]} {c}
                <span className="ml-1.5 font-mono text-[10px] opacity-70">
                  {sd}/{n}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.map(({ l, i }) => {
            const p = progress[l.spec.id];
            const ok = unlocked(i);
            const st = stars(p);
            return (
              <button
                key={l.spec.id}
                disabled={!ok}
                onClick={() => onPick(i)}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border p-4 text-left transition ${
                  ok
                    ? "border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:-translate-y-1 hover:border-amber-300/40 hover:shadow-[0_18px_40px_-20px_rgba(251,191,36,0.45)]"
                    : "cursor-not-allowed border-white/5 bg-white/[0.015] opacity-40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-3xl leading-none drop-shadow">{l.spec.emoji}</div>
                  <div className="text-right">
                    <div className="font-mono text-[9.5px] text-slate-500">
                      #{String(i + 1).padStart(3, "0")}
                    </div>
                    <div className="text-[11px] tracking-tighter">
                      {[0, 1, 2].map((s) => (
                        <span key={s} className={s < st ? "text-amber-300" : "text-slate-700"}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 text-[13.5px] font-bold leading-tight text-white">
                  {l.spec.name}
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{l.spec.category}</span>
                  <span className="font-mono">{l.pieces.length}장</span>
                </div>
                {p?.solved ? (
                  <div className="mt-2 inline-flex w-fit items-center rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    ✓ {Math.round(p.best * 100)}%
                  </div>
                ) : (
                  ok && (
                    <div className="mt-2 inline-flex w-fit items-center rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                      미완성
                    </div>
                  )
                )}
                {!ok && <div className="absolute right-3 top-3 text-base">🔒</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
