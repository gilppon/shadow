import ShadeFigure from "./ShadeFigure";

type Props = { onStart: () => void; onSelect: () => void; solvedCount: number; total: number };

export default function TitleScreen({ onStart, onSelect, solvedCount, total }: Props) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070910] px-5 py-10">
      {/* 배경 광원 */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-300/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-160px] right-[-80px] h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[110px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at 50% 40%, black, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <div className="rise-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-amber-200">
              SHADOW ANGLE MATCH · 그림자 예술 퍼즐
            </div>
            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
              그림자 각도
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300 bg-clip-text text-transparent">
                맞추기
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-300/90">
              물체는 <b className="text-white">절대 움직이지 않습니다</b>.
              <br />
              사방에 붙잡힌 <b className="text-amber-200">광원(조명)</b>만 터치 · 드래그로 옮겨,
              벽에 드리워진 그림자를 목표 실루엣과 완벽하게 겹치세요.
              <br />
              <span className="text-slate-400">
                깊이가 다른 종이 조각들은 빛의 방향에 따라 제각각으로 흐트러집니다.
              </span>
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={onStart}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 px-7 py-3.5 text-[15px] font-bold text-amber-950 shadow-[0_10px_30px_-8px_rgba(251,191,36,0.6)] transition hover:scale-[1.03] active:scale-95"
              >
                <span className="relative z-10">💡 불 켜고 시작하기</span>
                <span className="absolute inset-0 sweep opacity-40" />
              </button>
              <button
                onClick={onSelect}
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-[15px] font-semibold text-slate-200 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
              >
                그림자 목록 ({solvedCount}/{total})
              </button>
            </div>

            <div className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[11.5px] text-slate-300">
              <span>
                🗂 총 <b className="text-amber-200">{total}</b>가지 그림자
              </span>
              <span className="text-slate-600">|</span>
              <span>
                🐦 새 · 🐾 동물 · 🐙 바다 · 🦋 곤충 · 🌿 자연 · 🔑 사물 · ⭐ 기호 · 🍓 음식 · 🥷 캐릭터
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: "↔️",
                  t: "빛만 움직여요",
                  d: "화면 아무 곳이나 드래그하면 조명이 이동합니다. 방향키로 정밀 조정.",
                },
                {
                  icon: "🧩",
                  t: "깊이가 다른 조각들",
                  d: "앞의 조각은 크게, 뒤의 조각은 조금 밀려나며 그림자가 변형됩니다.",
                },
                {
                  icon: "🥷",
                  t: "요원 쉐이드",
                  d: "그림자가 완성되면 벽 속에서 짠 하고 튀어나와 인사합니다.",
                },
              ].map((c) => (
                <div
                  key={c.t}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur"
                >
                  <div className="text-xl">{c.icon}</div>
                  <div className="mt-1.5 text-[13px] font-bold text-white">{c.t}</div>
                  <div className="mt-1 text-[11.5px] leading-relaxed text-slate-400">{c.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 쉐이드 */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-64 w-64 rounded-full bg-amber-200/10 blur-3xl" />
            <div
              className="absolute bottom-6 h-10 w-40 rounded-[50%] bg-black/60 blur-md"
              aria-hidden
            />
            <div className="float-y relative">
              <ShadeFigure size={230} />
            </div>
            <div className="absolute -right-1 top-2 max-w-[190px] rounded-2xl rounded-bl-sm border border-white/10 bg-[#111726]/90 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-slate-300 shadow-xl backdrop-blur">
              "빛이 어디 있느냐가,
              <br />
              그림자가 무엇이 되느냐를 정하지."
              <span className="mt-1 block text-right text-[10px] font-bold text-amber-300/80">
                — 그림자 요원 쉐이드
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
