import { useRef } from "react";
import { Z_WALL, clamp, projectPoly, type Light, type Pt } from "../game/geometry";
import type { Level } from "../game/levels";
import { sfx } from "../game/sound";

type Props = {
  level: Level;
  light: Light;
  onChange: (l: Light) => void;
  locked: boolean;
};

const PAD_W = 244;
const PAD_H = 158;
const SIDE_W = 244;
const SIDE_H = 74;
const ZX0 = 26; // side view left padding
const ZX1 = 214; // side view wall x

const padX = (x: number, b: Level["bounds"]) => 16 + ((x - b.x0) / (b.x1 - b.x0)) * (PAD_W - 32);
const padY = (y: number, b: Level["bounds"]) => 14 + ((y - b.y0) / (b.y1 - b.y0)) * (PAD_H - 28);
const sideX = (z: number, b: Level["bounds"]) =>
  ZX0 + ((z - b.z0) / (Z_WALL - b.z0)) * (ZX1 - ZX0);
const sideY = (y: number) => 8 + (y / 400) * (SIDE_H - 16);

export default function LightPad({ level, light, onChange, locked }: Props) {
  const padRef = useRef<SVGSVGElement>(null);
  const sideRef = useRef<SVGSVGElement>(null);
  const dragPad = useRef(false);
  const dragSide = useRef(false);
  const b = level.bounds;

  const fromPad = (clientX: number, clientY: number) => {
    const el = padRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * PAD_W;
    const y = ((clientY - r.top) / r.height) * PAD_H;
    onChange({
      x: clamp(b.x0 + ((x - 16) / (PAD_W - 32)) * (b.x1 - b.x0), b.x0, b.x1),
      y: clamp(b.y0 + ((y - 14) / (PAD_H - 28)) * (b.y1 - b.y0), b.y0, b.y1),
      z: light.z,
    });
  };

  const fromSide = (clientX: number) => {
    const el = sideRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * SIDE_W;
    onChange({
      ...light,
      z: clamp(b.z0 + ((x - ZX0) / (ZX1 - ZX0)) * (Z_WALL - b.z0), b.z0, b.z1),
    });
  };

  // 사이드뷰용: 조각들의 y범위 + 벽에 맺히는 그림자 범위
  const bands = level.pieces.map((p) => {
    const ys = p.obj.map((q) => q[1]);
    return { z: p.z, y0: Math.min(...ys), y1: Math.max(...ys) };
  });
  const proj: Pt[][] = level.pieces.map((p) => projectPoly(p.obj, p.z, light));
  const pYs = proj.flat().map((q) => q[1]);
  const shadowTop = sideY(Math.min(...pYs));
  const shadowBot = sideY(Math.max(...pYs));
  const lx = sideX(light.z, b);
  const ly = sideY(light.y);

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[11px] font-bold tracking-widest text-amber-200/70">
            조명 위치 · 앞/뒤/좌우
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            x {Math.round(light.x)} / y {Math.round(light.y)}
          </span>
        </div>
        <svg
          ref={padRef}
          viewBox={`0 0 ${PAD_W} ${PAD_H}`}
          className={`w-full touch-none rounded-xl border border-white/10 bg-[#0d111b] ${
            locked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
          }`}
          onPointerDown={(e) => {
            if (locked) return;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            dragPad.current = true;
            fromPad(e.clientX, e.clientY);
            sfx.grab();
          }}
          onPointerMove={(e) => {
            if (dragPad.current && !locked) fromPad(e.clientX, e.clientY);
          }}
          onPointerUp={() => (dragPad.current = false)}
          onPointerCancel={() => (dragPad.current = false)}
        >
          <defs>
            <pattern id="padGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="#ffffff" strokeOpacity="0.06" />
            </pattern>
            <radialGradient id="padPool" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe9b0" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffe9b0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={PAD_W} height={PAD_H} fill="url(#padGrid)" rx="12" />
          <circle
            cx={padX(light.x, b)}
            cy={padY(light.y, b)}
            r="46"
            fill="url(#padPool)"
          />
          {/* 벽(뒤) */}
          <rect
            x="26"
            y="24"
            width={PAD_W - 52}
            height={PAD_H - 48}
            fill="#ffffff"
            fillOpacity="0.03"
            stroke="#ffffff"
            strokeOpacity="0.14"
            strokeDasharray="4 4"
            rx="4"
          />
          <text
            x={PAD_W / 2}
            y="19"
            textAnchor="middle"
            className="fill-slate-500"
            style={{ fontSize: 8, letterSpacing: 1 }}
          >
            벽 (WALL)
          </text>
          {/* 물체 자국 */}
          <g>
            {level.pieces.map((p, i) => {
              const xs = p.obj.map((q) => q[0]);
              const ys = p.obj.map((q) => q[1]);
              const px = padX((Math.min(...xs) + Math.max(...xs)) / 2, b);
              const py = padY((Math.min(...ys) + Math.max(...ys)) / 2, b);
              const w = Math.max(
                3,
                (padX(Math.max(...xs), b) - padX(Math.min(...xs), b)) * 0.9,
              );
              const h = Math.max(
                3,
                (padY(Math.max(...ys), b) - padY(Math.min(...ys), b)) * 0.9,
              );
              return (
                <rect
                  key={i}
                  x={px - w / 2}
                  y={py - h / 2}
                  width={w}
                  height={h}
                  rx="2"
                  fill="#38bdf8"
                  fillOpacity={0.1 + (p.z / 100) * 0.22}
                  stroke="#7dd3fc"
                  strokeOpacity="0.4"
                  strokeWidth="0.7"
                />
              );
            })}
          </g>
          {/* 십자선 */}
          <g stroke="#fbbf24" strokeOpacity="0.25" strokeWidth="0.8">
            <line x1="0" y1={padY(light.y, b)} x2={PAD_W} y2={padY(light.y, b)} />
            <line x1={padX(light.x, b)} y1="0" x2={padX(light.x, b)} y2={PAD_H} />
          </g>
          {/* 전구 */}
          <circle
            cx={padX(light.x, b)}
            cy={padY(light.y, b)}
            r="7"
            fill="#0b0e15"
            stroke="#fbbf24"
            strokeWidth="1.6"
          />
          <circle cx={padX(light.x, b)} cy={padY(light.y, b)} r="3" fill="#fff7d6" />
        </svg>
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[11px] font-bold tracking-widest text-amber-200/70">
            조명 깊이 · 옆에서 보기
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            z {Math.round(light.z)} (벽까지 {Math.round(Z_WALL - light.z)})
          </span>
        </div>
        <svg
          ref={sideRef}
          viewBox={`0 0 ${SIDE_W} ${SIDE_H}`}
          className={`w-full touch-none rounded-xl border border-white/10 bg-[#0d111b] ${
            locked ? "cursor-default" : "cursor-ew-resize"
          }`}
          onPointerDown={(e) => {
            if (locked) return;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            dragSide.current = true;
            fromSide(e.clientX);
            sfx.grab();
          }}
          onPointerMove={(e) => {
            if (dragSide.current && !locked) fromSide(e.clientX);
          }}
          onPointerUp={() => (dragSide.current = false)}
          onPointerCancel={() => (dragSide.current = false)}
        >
          {/* 광선 → 벽 */}
          <g stroke="#fcd34d" strokeOpacity="0.5" strokeWidth="0.8">
            {bands.map((bd, i) => {
              const t = (Z_WALL - light.z) / (bd.z - light.z);
              const y0w = light.y + (bd.y0 - light.y) * t;
              const y1w = light.y + (bd.y1 - light.y) * t;
              return (
                <g key={i}>
                  <line
                    x1={lx}
                    y1={ly}
                    x2={ZX1 + 6}
                    y2={sideY(Math.min(y0w, y1w))}
                  />
                  <line
                    x1={lx}
                    y1={ly}
                    x2={ZX1 + 6}
                    y2={sideY(Math.max(y0w, y1w))}
                  />
                </g>
              );
            })}
          </g>
          {/* 조각들(깊이별) */}
          {bands.map((bd, i) => (
            <line
              key={i}
              x1={sideX(bd.z, b)}
              y1={sideY(bd.y0)}
              x2={sideX(bd.z, b)}
              y2={sideY(bd.y1)}
              stroke="#38bdf8"
              strokeOpacity={0.75}
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          ))}
          {/* 벽 + 그림자 */}
          <rect x={ZX1 + 4} y="4" width="8" height={SIDE_H - 8} rx="2" fill="#e7e0cd" />
          <rect x={ZX1 + 4} y={shadowTop} width="8" height={Math.max(2, shadowBot - shadowTop)} fill="#0b0e15" />
          {/* 전구 */}
          <circle cx={lx} cy={ly} r="7" fill="#0b0e15" stroke="#fbbf24" strokeWidth="1.6" />
          <circle cx={lx} cy={ly} r="3" fill="#fff7d6" />
          <line
            x1={lx}
            y1={SIDE_H - 3}
            x2={lx}
            y2={SIDE_H - 3}
            stroke="#fbbf24"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
