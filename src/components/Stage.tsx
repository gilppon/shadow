import { useEffect, useMemo, useRef } from "react";
import { Z_WALL, clamp, convexHull, toPath, type Light, type Pt } from "../game/geometry";
import type { Level } from "../game/levels";
import { sfx } from "../game/sound";
import ShadeFigure from "./ShadeFigure";

type Props = {
  level: Level;
  light: Light;
  shadow: Pt[][];
  onChange: (l: Light) => void;
  locked: boolean;
  showGhost: boolean;
  showRays: boolean;
  blur: number;
  solved: boolean;
};

export default function Stage({
  level,
  light,
  shadow,
  onChange,
  locked,
  showGhost,
  showRays,
  blur,
  solved,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const rays = useMemo(() => {
    if (!showRays) return [] as { x1: number; y1: number; x2: number; y2: number }[];
    const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const perPiece = shadow.length > 8 ? 3 : shadow.length > 5 ? 4 : 6;
    shadow.forEach((proj) => {
      const hull = convexHull(proj);
      const step = Math.max(1, Math.ceil(hull.length / perPiece));
      for (let i = 0; i < hull.length; i += step) {
        out.push({ x1: light.x, y1: light.y, x2: hull[i][0], y2: hull[i][1] });
      }
    });
    return out.slice(0, 70);
  }, [showRays, shadow, light.x, light.y]);

  const toLocal = (clientX: number, clientY: number) => {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * 600,
      y: ((clientY - r.top) / r.height) * 400,
    };
  };

  const apply = (x: number, y: number) => {
    const b = level.bounds;
    onChange({
      x: clamp(x, b.x0, b.x1),
      y: clamp(y, b.y0, b.y1),
      z: light.z,
    });
  };

  // 휠로 깊이 조절 (non-passive)
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (locked) return;
      e.preventDefault();
      const b = level.bounds;
      onChange({
        ...light,
        z: clamp(light.z + (e.deltaY > 0 ? -4 : 4), b.z0, b.z1),
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [light, locked, level.bounds, onChange]);

  const glowR = 150 + (Z_WALL - light.z) * 1.15;
  const orbR = 8 + (Z_WALL - light.z) * 0.075;
  const cxp = (light.x / 600) * 100;
  const cyp = (light.y / 400) * 100;

  // 쉐이드 동반자(그림자) 늘어남 계산
  const ax = 54;
  const ay = 372;
  const vx = ax - light.x;
  const vy = ay - light.y;
  const vlen = Math.hypot(vx, vy) || 1;
  const k = clamp((vlen - 150) / 420, -0.25, 0.75);
  const ang = (Math.atan2(vy, vx) * 180) / Math.PI;
  const shadeT = `translate(${ax + (vx / vlen) * 14} ${ay + (vy / vlen) * 6}) rotate(${ang}) scale(${1 + 0.5 * k} ${1 - 0.16 * k}) rotate(${-ang}) scale(0.30) translate(-60 -70)`;

  const blurFilters = useMemo(
    () =>
      level.pieces.map((p, i) => ({
        id: `pen${i}`,
        sd: 0.3 + blur * ((Z_WALL - p.z) / Z_WALL) * 1.35,
      })),
    [level, blur],
  );

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 400"
      role="application"
      aria-label="그림자 맞추기 월. 방향키로 조명을 움직여 목표 실루엣에 맞추세요."
      className={`w-full touch-none select-none ${locked ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
      onPointerDown={(e) => {
        if (locked) return;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        dragging.current = true;
        const p = toLocal(e.clientX, e.clientY);
        if (p) apply(p.x, p.y);
        sfx.grab();
      }}
      onPointerMove={(e) => {
        if (!dragging.current || locked) return;
        const p = toLocal(e.clientX, e.clientY);
        if (p) apply(p.x, p.y);
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      <defs>
        <radialGradient id="wallGrad" cx={`${cxp}%`} cy={`${cyp}%`} r={`${Math.max(40, (glowR / 600) * 130)}%`}>
          <stop offset="0%" stopColor="#fffaf0" />
          <stop offset="34%" stopColor="#f6eedb" />
          <stop offset="70%" stopColor="#d8cfba" />
          <stop offset="100%" stopColor="#9b9484" />
        </radialGradient>
        <radialGradient id="vign" cx="50%" cy="50%" r="72%">
          <stop offset="55%" stopColor="#1a1410" stopOpacity="0" />
          <stop offset="100%" stopColor="#120e0a" stopOpacity="0.45" />
        </radialGradient>
        <radialGradient id="pool" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6dd" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ffe9b8" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ffdca0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="orbGrad" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#ffeeb8" />
          <stop offset="100%" stopColor="#ffb347" />
        </radialGradient>
        <filter id="orbGlow" x="-140%" y="-140%" width="380%" height="380%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="wallClip">
          <rect x="0" y="0" width="600" height="400" rx="6" />
        </clipPath>
        {blurFilters.map((f) => (
          <filter
            key={f.id}
            id={f.id}
            x="-45%"
            y="-45%"
            width="190%"
            height="190%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={f.sd} />
          </filter>
        ))}
      </defs>

      {/* 방 어둠 */}
      <rect x="-40" y="-40" width="680" height="480" fill="#0a0c12" />

      <g clipPath="url(#wallClip)">
        {/* 벽 */}
        <rect x="0" y="0" width="600" height="400" fill="url(#wallGrad)" />
        {/* 벽 질감 */}
        <g opacity="0.05" stroke="#4a4030" strokeWidth="1">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1="0" y1={i * 40} x2="600" y2={i * 40} />
          ))}
        </g>
        <circle cx={light.x} cy={light.y} r={glowR} fill="url(#pool)" />

        {/* 광선 */}
        {showRays && (
          <g stroke="#7c5c1e" strokeOpacity="0.26" strokeWidth="0.8">
            {rays.map((r, i) => (
              <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
            ))}
          </g>
        )}

        {/* 목표 실루엣(설계도) */}
        {showGhost && (
          <g>
            {level.target.map((t, i) => (
              <path
                key={i}
                d={toPath(t)}
                fill={solved ? "rgba(52,211,153,0.16)" : "rgba(59,130,246,0.09)"}
                stroke={solved ? "rgba(16,185,129,0.85)" : "rgba(37,99,235,0.55)"}
                strokeWidth={solved ? 2 : 1.4}
                strokeDasharray={solved ? undefined : "6 5"}
                strokeLinejoin="round"
              />
            ))}
          </g>
        )}

        {/* 쉐이드 동반자 그림자 */}
        <g opacity={0.72} style={{ transition: "transform 260ms ease-out" }} transform={shadeT}>
          <g>
            <ShadeFigure size={120} eyeColor="#4fd6ff" wings={false} />
          </g>
        </g>

        {/* 실제 그림자 */}
        <g>
          {shadow.map((s, i) => (
            <path
              key={i}
              d={toPath(s)}
              fill="#04060a"
              fillOpacity={0.94}
              filter={`url(#pen${i})`}
            />
          ))}
        </g>

        <rect x="0" y="0" width="600" height="400" fill="url(#vign)" />

        {/* 조명 orb */}
        {!locked && (
          <g>
            <circle
              cx={light.x}
              cy={light.y}
              r={orbR * 3.1}
              fill="#ffe9b0"
              opacity="0.22"
              filter="url(#orbGlow)"
            />
            <circle
              cx={light.x}
              cy={light.y}
              r={orbR}
              fill="url(#orbGrad)"
              filter="url(#orbGlow)"
            />
            <circle
              cx={light.x}
              cy={light.y}
              r={orbR + 9}
              fill="none"
              stroke="#fff3cf"
              strokeOpacity="0.5"
              strokeWidth="1"
              strokeDasharray="3 6"
              className="spin-slow"
            />
          </g>
        )}

        {solved && (
          <g className="flare" transform="translate(300 200)">
            <circle r="10" fill="#fff" opacity="0.85" />
          </g>
        )}
      </g>

      {/* 벽 프레임 */}
      <rect
        x="1"
        y="1"
        width="598"
        height="398"
        rx="6"
        fill="none"
        stroke="#2b2f3d"
        strokeWidth="2"
      />
      <rect
        x="8"
        y="8"
        width="584"
        height="384"
        rx="3"
        fill="none"
        stroke="#000"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
    </svg>
  );
}
