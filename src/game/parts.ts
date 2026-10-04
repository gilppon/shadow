import { ellipse, rrect, type Pt } from "./geometry";

/** 한 장의 "종이 조각" = 특정 깊이 z 에 놓인 다각형 */
export type Part = { z: number; pts: Pt[] };

/* ------------------------------------------------------------------ */
/* 프리미티브                                                           */
/* ------------------------------------------------------------------ */

export const E = (
  z: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot = 0,
): Part => ({ z, pts: ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 26, rot) });

export const C = (z: number, cx: number, cy: number, r: number): Part => E(z, cx, cy, r, r);

export const RR = (z: number, cx: number, cy: number, w: number, h: number, r = 4): Part => ({
  z,
  pts: rrect(cx, cy, Math.abs(w), Math.abs(h), r),
});

export const P = (z: number, ...xy: number[]): Part => {
  const pts: Pt[] = [];
  for (let i = 0; i + 1 < xy.length; i += 2) pts.push([xy[i], xy[i + 1]]);
  return { z, pts };
};

/** 두께가 w0 → w1 로 줄어드는 띠 (목·꼬리·촉수·줄기) */
export function ribbonPts(path: [number, number][], w0 = 10, w1 = 3): Pt[] {
  const n = path.length;
  const a: Pt[] = [];
  const b: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const prev = path[Math.max(0, i - 1)];
    const next = path[Math.min(n - 1, i + 1)];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const w = (w0 + ((w1 - w0) * i) / Math.max(1, n - 1)) / 2;
    a.push([path[i][0] + nx * w, path[i][1] + ny * w]);
    b.push([path[i][0] - nx * w, path[i][1] - ny * w]);
  }
  return a.concat(b.reverse());
}

export const RIB = (
  z: number,
  path: [number, number][],
  w0 = 10,
  w1 = 3,
): Part => ({ z, pts: ribbonPts(path, w0, w1) });

export function starPts(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  n = 5,
  rot = -Math.PI / 2,
): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? r1 : r2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

export const STAR = (
  z: number,
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  n = 5,
  rot = -Math.PI / 2,
): Part => ({ z, pts: starPts(cx, cy, r1, r2, n, rot) });

/**
 * 결정적 깊이 해시 (34 ~ 80).
 * 6개의 "레이어" 깊이로 양자화 → 종이를 겹쳐 붙인 그림자 예술처럼
 * 조각들이 몇 묶음으로 함께 움직여 퍼즐이 풀 수 있게 한다.
 */
export function dpt(seed: number, i: number, lo = 34, hi = 80): number {
  const x = Math.sin(seed * 12.9898 + i * 78.233 + 7.7) * 43758.5453;
  const f = x - Math.floor(x);
  const layers = 6;
  const q = Math.floor(f * layers) / (layers - 1);
  return Math.round(lo + q * (hi - lo));
}

const D = (seed: number) => (i: number) => dpt(seed, i);

/* ------------------------------------------------------------------ */
/* 사족보동물                                                           */
/* ------------------------------------------------------------------ */

export type EarKind = "point" | "long" | "round" | "horn" | "antler" | "mane" | "none";
export type TailKind = "thin" | "bushy" | "curl" | "stub" | "up" | "none";

export type QuadSpec = {
  seed: number;
  cx?: number;
  cy?: number;
  bodyRx?: number;
  bodyRy?: number;
  bodyRot?: number;
  headR?: number;
  neck?: number;
  snout?: number;
  trunk?: number;
  tusk?: boolean;
  ear?: EarKind;
  earLen?: number;
  earW?: number;
  tail?: TailKind;
  tailLen?: number;
  legLen?: number;
  legW?: number;
  legSpread?: number;
  hump?: number;
  mane?: number;
  upright?: boolean;
};

export function quad(s: QuadSpec): Part[] {
  const d = D(s.seed);
  const cx = s.cx ?? 300;
  const cy = s.cy ?? 224;
  const brx = s.bodyRx ?? 82;
  const bry = s.bodyRy ?? 47;
  const rot = s.bodyRot ?? 0;
  const hr = s.headR ?? 27;
  const neck = s.neck ?? 10;
  const up = s.upright ?? false;
  const parts: Part[] = [];

  parts.push(E(d(0), cx, cy, brx, bry, rot));
  const hx = up ? cx + brx * 0.1 : cx + brx * 0.72 + neck * 0.85;
  const hy = up ? cy - bry - hr - neck : cy - bry * 0.62 - neck;
  if (neck > 8 || up)
    parts.push(
      RIB(
        d(1),
        [
          [cx + brx * (up ? 0.1 : 0.3), cy - bry * (up ? 0.5 : 0.2)],
          [cx + brx * (up ? 0.2 : 0.62) + neck * 0.3, cy - bry * 0.5 - neck * 0.55],
          [hx, hy],
        ],
        brx * 0.5,
        hr * 1.7,
      ),
    );
  parts.push(E(d(2), hx, hy, hr, hr * 0.93));
  const sn = s.snout ?? 0;
  if (sn > 0)
    parts.push(
      P(
        d(3),
        hx + hr * 0.3, hy - hr * 0.3,
        hx + hr * 0.3 + sn, hy + hr * 0.1,
        hx + hr * 0.3 + sn, hy + hr * 0.55,
        hx + hr * 0.3, hy + hr * 0.5,
      ),
    );
  const tr = s.trunk ?? 0;
  if (tr > 0)
    parts.push(
      RIB(
        d(4),
        [
          [hx + hr * 0.5, hy + hr * 0.05],
          [hx + hr * 0.5 + tr * 0.5, hy + tr * 0.6],
          [hx + hr * 0.5 + tr * 0.22, hy + tr * 1.05],
        ],
        hr * 0.8,
        7,
      ),
    );
  if (s.tusk)
    parts.push(
      RIB(d(5), [[hx + hr * 0.45, hy + hr * 0.5], [hx + hr * 0.95, hy + hr * 0.95]], 8, 2),
    );

  const earLen = s.earLen ?? 32;
  const earW = s.earW ?? 13;
  switch (s.ear) {
    case "point":
      parts.push(P(d(6), hx - hr * 0.5, hy - hr * 0.5, hx - hr * 0.2, hy - hr * 0.5 - earLen, hx + hr * 0.08, hy - hr * 0.5));
      parts.push(P(d(7), hx + hr * 0.12, hy - hr * 0.5, hx + hr * 0.45, hy - hr * 0.5 - earLen * 0.88, hx + hr * 0.62, hy - hr * 0.42));
      break;
    case "long":
      parts.push(E(d(6), hx - hr * 0.42, hy - earLen * 0.68, earW, earLen, 12));
      parts.push(E(d(7), hx + hr * 0.42, hy - earLen * 0.72, earW, earLen * 1.05, -14));
      break;
    case "round":
      parts.push(C(d(6), hx - hr * 0.62, hy - hr * 0.72, earW * 0.95));
      parts.push(C(d(7), hx + hr * 0.62, hy - hr * 0.72, earW * 0.95));
      break;
    case "horn":
      parts.push(RIB(d(6), [[hx - hr * 0.32, hy - hr * 0.62], [hx - hr * 0.8, hy - hr * 0.62 - earLen]], 10, 2));
      parts.push(RIB(d(7), [[hx + hr * 0.32, hy - hr * 0.62], [hx + hr * 0.8, hy - hr * 0.62 - earLen]], 10, 2));
      break;
    case "antler":
      parts.push(RIB(d(6), [[hx - hr * 0.22, hy - hr * 0.6], [hx - hr * 0.55, hy - hr * 0.6 - earLen], [hx - hr * 0.95, hy - hr * 0.6 - earLen * 0.62]], 8, 2));
      parts.push(RIB(d(7), [[hx + hr * 0.22, hy - hr * 0.6], [hx + hr * 0.55, hy - hr * 0.6 - earLen], [hx + hr * 0.95, hy - hr * 0.6 - earLen * 0.62]], 8, 2));
      break;
    case "mane":
      parts.push(E(d(6), hx - hr * 0.22, hy, hr * 1.6, hr * 1.62));
      break;
    default:
      break;
  }
  if (s.hump)
    parts.push(E(d(8), cx - brx * 0.06, cy - bry * 0.58, brx * 0.44, bry * 0.66, -8));
  if (s.mane)
    parts.push(E(d(9), cx + brx * 0.42, cy - bry * 0.72, brx * 0.3, bry * 0.34, 26));

  const tl = s.tailLen ?? 62;
  const bx = cx - brx * 0.92;
  const by = cy - bry * 0.3;
  switch (s.tail) {
    case "thin":
      parts.push(RIB(d(10), [[bx, by], [bx - tl * 0.45, by - tl * 0.3], [bx - tl * 0.92, by - tl * 0.78]], 10, 3));
      break;
    case "bushy":
      parts.push(E(d(10), bx - tl * 0.42, by - tl * 0.34, tl * 0.52, tl * 0.34, 24));
      break;
    case "curl":
      parts.push(RIB(d(10), [[bx, by], [bx - tl * 0.52, by - tl * 0.48], [bx - tl * 0.98, by - tl * 0.12]], 12, 4));
      parts.push(C(d(11), bx - tl * 1.02, by + tl * 0.1, 7));
      break;
    case "stub":
      parts.push(P(d(10), bx + 2, by - 10, bx - tl * 0.42, by - tl * 0.5, bx + 6, by + 12));
      break;
    case "up":
      parts.push(RIB(d(10), [[bx, by], [bx - tl * 0.34, by - tl * 0.6], [bx - tl * 0.46, by - tl * 1.2]], 18, 7));
      break;
    default:
      break;
  }

  const ll = s.legLen ?? 60;
  const lw = s.legW ?? 15;
  const sp = s.legSpread ?? 0.5;
  parts.push(RR(d(12), cx - brx * sp, cy + bry * 0.68 + ll / 2 - 3, lw, ll, lw * 0.42));
  parts.push(RR(d(13), cx + brx * sp * 0.9, cy + bry * 0.68 + ll / 2 - 1, lw, ll * 0.97, lw * 0.42));
  parts.push(RR(d(14), cx - brx * sp * 0.74, cy + bry * 0.6 + ll / 2 + 2, lw * 0.88, ll * 0.9, lw * 0.4));
  parts.push(RR(d(15), cx + brx * sp * 1.14, cy + bry * 0.6 + ll / 2 + 4, lw * 0.88, ll * 0.87, lw * 0.4));
  return parts;
}

/* ------------------------------------------------------------------ */
/* 새                                                                  */
/* ------------------------------------------------------------------ */

export type BirdSpec = {
  seed: number;
  cx?: number;
  cy?: number;
  bodyRx?: number;
  bodyRy?: number;
  bodyRot?: number;
  headR?: number;
  neck?: number;
  beakLen?: number;
  beakH?: number;
  tailLen?: number;
  tailAng?: number;
  tailW?: number;
  legs?: number;
  wing?: number;
  wingRot?: number;
  crest?: number;
  facing?: 1 | -1;
  fan?: number;
  upright?: boolean;
};

export function bird(s: BirdSpec): Part[] {
  const d = D(s.seed);
  const f = s.facing ?? 1;
  const cx = (s.cx ?? 300) - 0;
  const cy = s.cy ?? 222;
  const brx = s.bodyRx ?? 74;
  const bry = s.bodyRy ?? 46;
  const rot = (s.bodyRot ?? -6) * f;
  const hr = s.headR ?? 26;
  const neck = s.neck ?? 8;
  const up = s.upright ?? false;
  const parts: Part[] = [];

  parts.push(E(d(0), cx, cy, brx, bry, rot));
  const hx = up ? cx + f * brx * 0.12 : cx + f * (brx * 0.74 + neck * 0.8);
  const hy = up ? cy - bry * 0.86 - hr * 0.82 : cy - bry * 0.66 - neck;
  if (neck > 8)
    parts.push(
      RIB(d(1), [[cx + f * brx * 0.3, cy - bry * 0.3], [cx + f * (brx * 0.6 + neck * 0.4), cy - bry * 0.45 - neck * 0.6], [hx, hy]], brx * 0.42, hr * 1.6),
    );
  parts.push(E(d(2), hx, hy, hr, hr * 0.95));
  const bl = s.beakLen ?? 30;
  const bh = s.beakH ?? 13;
  if (bl > 3)
    parts.push(
      P(d(3), hx + f * hr * 0.35, hy - bh * 0.5, hx + f * (hr * 0.35 + bl), hy + bh * 0.15, hx + f * hr * 0.35, hy + bh * 0.6),
    );
  if (s.crest)
    parts.push(
      P(d(4), hx - f * hr * 0.1, hy - hr * 0.7, hx + f * hr * 0.1, hy - hr * 0.7 - s.crest, hx + f * hr * 0.45, hy - hr * 0.55),
    );
  const tl = s.tailLen ?? 78;
  const ta = ((s.tailAng ?? -22) * Math.PI) / 180;
  const tx = cx - f * brx * 0.9;
  const ty = cy - bry * 0.2;
  const ex = tx - f * Math.cos(ta) * tl;
  const ey = ty + Math.sin(ta) * tl;
  const px = Math.sin(ta) * 17 * f;
  const py = Math.cos(ta) * 17;
  if (tl > 4) parts.push(P(d(5), tx, ty - 6, ex - px, ey - py, ex + px, ey + py, tx, ty + 14));
  if (s.fan) {
    const n = Math.round(s.fan);
    for (let i = 0; i < n; i++) {
      const a = (-70 + (140 * i) / Math.max(1, n - 1)) * (Math.PI / 180);
      parts.push(
        P(d(6 + i), tx, ty - 4, tx - Math.cos(a) * tl * 1.25, ty - 8 - Math.sin(a) * tl * 1.25, tx - Math.cos(a + 0.12) * tl * 0.8, ty - Math.sin(a + 0.12) * tl * 0.8),
      );
    }
  }
  if (s.wing)
    parts.push(
      E(d(20), cx - f * brx * 0.12, cy - bry * 0.12, s.wing, s.wing * 0.5, (s.wingRot ?? -14) * f),
    );
  const lg = s.legs ?? 0;
  if (lg > 0) {
    parts.push(RIB(d(21), [[cx + f * brx * 0.16, cy + bry * 0.8], [cx + f * brx * 0.2, cy + bry * 0.8 + lg]], 8, 6));
    parts.push(RIB(d(22), [[cx - f * brx * 0.2, cy + bry * 0.78], [cx - f * brx * 0.26, cy + bry * 0.78 + lg * 0.95]], 8, 6));
    parts.push(P(d(23), cx + f * brx * 0.2, cy + bry * 0.8 + lg, cx + f * (brx * 0.2 + 20), cy + bry * 0.8 + lg + 3, cx + f * brx * 0.2, cy + bry * 0.8 + lg + 4));
    parts.push(P(d(24), cx - f * brx * 0.26, cy + bry * 0.78 + lg * 0.95, cx - f * (brx * 0.26 + 18), cy + bry * 0.78 + lg * 0.95 + 3, cx - f * brx * 0.26, cy + bry * 0.78 + lg * 0.95 + 4));
  }
  return parts;
}

/* ------------------------------------------------------------------ */
/* 바다                                                                */
/* ------------------------------------------------------------------ */

export type FishSpec = {
  seed: number;
  cx?: number;
  cy?: number;
  bodyRx?: number;
  bodyRy?: number;
  bodyRot?: number;
  tail?: number;
  tailSpread?: number;
  dorsal?: number;
  ventral?: number;
  sideFin?: number;
  whisker?: number;
  tentacles?: number;
  dome?: number;
  claws?: boolean;
  shell?: boolean;
  arms?: number;
};

export function fish(s: FishSpec): Part[] {
  const d = D(s.seed);
  const cx = s.cx ?? 300;
  const cy = s.cy ?? 205;
  const brx = s.bodyRx ?? 88;
  const bry = s.bodyRy ?? 52;
  const parts: Part[] = [];

  parts.push(E(d(0), cx, cy, brx, bry, s.bodyRot ?? 0));
  const tl = s.tail ?? 72;
  const ts = s.tailSpread ?? 58;
  if (tl > 4)
    parts.push(P(d(1), cx + brx * 0.82, cy - 4, cx + brx * 0.82 + tl, cy - ts, cx + brx * 0.82 + tl, cy + ts, cx + brx * 0.82, cy + 10));
  if (s.dorsal)
    parts.push(P(d(2), cx - brx * 0.1, cy - bry * 0.82, cx + brx * 0.16, cy - bry * 0.82 - s.dorsal, cx + brx * 0.4, cy - bry * 0.8));
  if (s.ventral)
    parts.push(P(d(3), cx - brx * 0.1, cy + bry * 0.82, cx + brx * 0.1, cy + bry * 0.82 + s.ventral, cx + brx * 0.34, cy + bry * 0.8));
  if (s.sideFin)
    parts.push(P(d(4), cx - brx * 0.1, cy + bry * 0.2, cx - brx * 0.42, cy + bry * 0.2 + s.sideFin, cx + brx * 0.12, cy + bry * 0.55));
  if (s.whisker) {
    parts.push(RIB(d(5), [[cx + brx * 0.88, cy + bry * 0.3], [cx + brx * 0.88 + s.whisker, cy + bry * 0.3 + s.whisker * 0.5]], 6, 2));
    parts.push(RIB(d(6), [[cx + brx * 0.86, cy + bry * 0.5], [cx + brx * 0.86 + s.whisker * 0.8, cy + bry * 0.5 + s.whisker * 0.9]], 6, 2));
  }
  if (s.tentacles) {
    const n = Math.round(s.tentacles);
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const x = cx - brx * 0.7 + t * brx * 1.4;
      parts.push(
        RIB(d(7 + i), [[x, cy + bry * 0.7], [x + (t - 0.5) * 70, cy + bry * 0.7 + 55], [x + (t - 0.5) * 110, cy + bry * 0.7 + 105]], 16, 4),
      );
    }
  }
  if (s.dome) {
    parts.push(E(d(30), cx, cy, brx, s.dome, 0));
    const n = 6;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const x = cx - brx * 0.78 + t * brx * 1.56;
      parts.push(RIB(d(31 + i), [[x, cy + s.dome * 0.55], [x + (t - 0.5) * 40, cy + s.dome + 70]], 13, 3));
    }
  }
  if (s.claws) {
    parts.push(E(d(40), cx, cy, brx * 0.78, bry * 0.55));
    parts.push(P(d(41), cx - brx * 0.7, cy - bry * 0.5, cx - brx * 1.3, cy - bry * 1.35, cx - brx * 0.72, cy - bry * 0.85));
    parts.push(P(d(42), cx + brx * 0.7, cy - bry * 0.5, cx + brx * 1.3, cy - bry * 1.35, cx + brx * 0.72, cy - bry * 0.85));
    for (let i = 0; i < 3; i++) {
      parts.push(RIB(d(43 + i), [[cx - brx * 0.6 + i * 26, cy + bry * 0.4], [cx - brx * 1.0 + i * 30, cy + bry * 0.4 + 46]], 9, 3));
      parts.push(RIB(d(50 + i), [[cx - brx * 0.6 + i * 26, cy + bry * 0.4], [cx - brx * 0.3 + i * 30, cy + bry * 0.4 + 52]], 9, 3));
    }
  }
  if (s.shell) {
    parts.push(E(d(60), cx, cy, brx, bry * 0.78));
    parts.push(E(d(61), cx + brx * 0.95, cy - bry * 0.1, brx * 0.24, bry * 0.24));
    parts.push(E(d(62), cx - brx * 0.9, cy, brx * 0.3, bry * 0.2, -30));
    parts.push(E(d(63), cx + brx * 0.3, cy + bry * 0.5, brx * 0.34, bry * 0.2, 30));
    parts.push(E(d(64), cx - brx * 0.4, cy + bry * 0.5, brx * 0.34, bry * 0.2, -30));
  }
  if (s.arms) {
    const n = Math.round(s.arms);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      parts.push(E(d(70 + i), cx + Math.cos(a) * brx * 0.62, cy + Math.sin(a) * brx * 0.62, brx * 0.44, brx * 0.2, (a * 180) / Math.PI));
    }
  }
  return parts;
}

/* ------------------------------------------------------------------ */
/* 곤충                                                                */
/* ------------------------------------------------------------------ */

export type BugSpec = {
  seed: number;
  cx?: number;
  cy?: number;
  bodyRx?: number;
  bodyRy?: number;
  bodyRot?: number;
  wingUp?: number;
  wingLow?: number;
  wingRot?: number;
  slim?: number;
  legs?: number;
  antennae?: boolean;
  round?: boolean;
  spiral?: boolean;
};

export function bug(s: BugSpec): Part[] {
  const d = D(s.seed);
  const cx = s.cx ?? 300;
  const cy = s.cy ?? 200;
  const brx = s.bodyRx ?? 14;
  const bry = s.bodyRy ?? 62;
  const parts: Part[] = [];

  parts.push(E(d(0), cx, cy, brx, bry, s.bodyRot ?? 0));
  if (s.wingUp) {
    const w = s.wingUp;
    parts.push(E(d(1), cx - w * 0.72, cy - bry * 0.24, w, w * 0.46, -(s.wingRot ?? 20)));
    parts.push(E(d(2), cx + w * 0.72, cy - bry * 0.24, w, w * 0.46, (s.wingRot ?? 20)));
  }
  if (s.wingLow) {
    const w = s.wingLow;
    parts.push(E(d(3), cx - w * 0.66, cy + bry * 0.42, w, w * 0.42, (s.wingRot ?? 26) + 8));
    parts.push(E(d(4), cx + w * 0.66, cy + bry * 0.42, w, w * 0.42, -((s.wingRot ?? 26) + 8)));
  }
  if (s.slim) {
    const n = Math.round(s.slim);
    for (let i = 0; i < n; i++) {
      const y = cy - bry + 14 + (i * (bry * 2 - 28)) / Math.max(1, n - 1);
      const w = 15 + 12 * Math.sin((i / Math.max(1, n - 1)) * Math.PI);
      parts.push(E(d(5 + i), cx, y, w, 13));
    }
  }
  if (s.legs) {
    const n = Math.round(s.legs);
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const y = cy - bry * 0.6 + t * bry * 1.2;
      parts.push(RIB(d(30 + i), [[cx - brx * 0.5, y], [cx - brx * 1.9, y - 16 + t * 22]], 7, 3));
      parts.push(RIB(d(40 + i), [[cx + brx * 0.5, y], [cx + brx * 1.9, y - 16 + t * 22]], 7, 3));
    }
  }
  if (s.antennae) {
    parts.push(RIB(d(50), [[cx - brx * 0.4, cy - bry * 0.86], [cx - brx * 2.1, cy - bry * 1.5]], 6, 2));
    parts.push(RIB(d(51), [[cx + brx * 0.4, cy - bry * 0.86], [cx + brx * 2.1, cy - bry * 1.5]], 6, 2));
  }
  if (s.round) {
    parts.push(E(d(60), cx, cy - bry * 1.05, brx * 2.6, brx * 2.6 * 0.85));
  }
  if (s.spiral) {
    parts.push(C(d(61), cx + 34, cy - 30, 40));
    parts.push(RIB(d(62), [[cx - 46, cy + 30], [cx + 44, cy + 30]], 42, 42));
    parts.push(RIB(d(63), [[cx + 30, cy - 62], [cx + 44, cy - 96]], 7, 4));
    parts.push(RIB(d(64), [[cx + 40, cy - 62], [cx + 58, cy - 92]], 7, 4));
  }
  return parts;
}

/* ------------------------------------------------------------------ */
/* 사람 / 캐릭터                                                        */
/* ------------------------------------------------------------------ */

export type PersonSpec = {
  seed: number;
  cx?: number;
  hat?: "none" | "pointy" | "crown" | "round" | "antenna" | "helmet" | "santa" | "mask";
  body?: "slim" | "wide" | "skirt" | "round";
  arms?: "down" | "up" | "side" | "wide";
  wings?: boolean;
  halo?: boolean;
  beard?: boolean;
  headR?: number;
};

export function person(s: PersonSpec): Part[] {
  const d = D(s.seed);
  const cx = s.cx ?? 300;
  const hr = s.headR ?? 34;
  const hy = 128;
  const by = 232;
  const parts: Part[] = [];

  parts.push(C(d(0), cx, hy, hr));
  const bw = s.body === "wide" ? 62 : s.body === "round" ? 74 : 46;
  const bh = s.body === "round" ? 84 : 96;
  if (s.body === "skirt") {
    parts.push(P(d(1), cx - bw / 2, by - 40, cx + bw / 2, by - 40, cx + bw * 1.5, by + 52, cx - bw * 1.5, by + 52));
  } else {
    parts.push(E(d(1), cx, by, bw / 2, bh / 2));
  }
  if (s.hat === "pointy")
    parts.push(P(d(2), cx - hr * 0.95, hy - hr * 0.5, cx + hr * 0.95, hy - hr * 0.5, cx + hr * 0.1, hy - hr * 2.4));
  if (s.hat === "crown")
    parts.push(P(d(2), cx - hr * 0.85, hy - hr * 0.72, cx - hr * 0.85, hy - hr * 1.5, cx - hr * 0.4, hy - hr * 1.15, cx, hy - hr * 1.6, cx + hr * 0.4, hy - hr * 1.15, cx + hr * 0.85, hy - hr * 1.5, cx + hr * 0.85, hy - hr * 0.72));
  if (s.hat === "round") parts.push(E(d(2), cx, hy - hr * 1.05, hr * 1.15, hr * 0.5));
  if (s.hat === "antenna") {
    parts.push(RIB(d(2), [[cx, hy - hr * 0.95], [cx, hy - hr * 1.9]], 6, 4));
    parts.push(C(d(3), cx, hy - hr * 2.05, 9));
  }
  if (s.hat === "helmet") parts.push(E(d(2), cx, hy - hr * 0.12, hr * 1.28, hr * 1.3));
  if (s.hat === "santa") {
    parts.push(P(d(2), cx - hr * 1.0, hy - hr * 0.55, cx + hr * 1.0, hy - hr * 0.55, cx + hr * 0.5, hy - hr * 2.1, cx - hr * 0.2, hy - hr * 2.25));
    parts.push(E(d(3), cx + hr * 0.55, hy - hr * 2.15, hr * 0.42, hr * 0.36));
  }
  if (s.hat === "mask") parts.push(P(d(2), cx - hr * 0.9, hy - hr * 0.25, cx + hr * 0.9, hy - hr * 0.25, cx + hr * 0.8, hy + hr * 0.2, cx - hr * 0.8, hy + hr * 0.2));

  const aw = s.arms === "wide" ? 96 : 74;
  if (s.arms === "up") {
    parts.push(RIB(d(4), [[cx - bw * 0.4, by - 34], [cx - bw * 0.4 - 30, by - 88], [cx - bw * 0.28, by - 132]], 16, 9));
    parts.push(RIB(d(5), [[cx + bw * 0.4, by - 34], [cx + bw * 0.4 + 30, by - 88], [cx + bw * 0.28, by - 132]], 16, 9));
  } else if (s.arms === "side") {
    parts.push(RIB(d(4), [[cx - bw * 0.42, by - 30], [cx - bw * 0.42 - 62, by - 14]], 17, 10));
    parts.push(RIB(d(5), [[cx + bw * 0.42, by - 30], [cx + bw * 0.42 + 62, by - 14]], 17, 10));
  } else if (s.arms === "wide") {
    parts.push(E(d(4), cx - aw * 0.6, by - 22, aw * 0.5, 13, 18));
    parts.push(E(d(5), cx + aw * 0.6, by - 22, aw * 0.5, 13, -18));
  } else {
    parts.push(RIB(d(4), [[cx - bw * 0.42, by - 32], [cx - bw * 0.5 - 14, by + 26]], 17, 11));
    parts.push(RIB(d(5), [[cx + bw * 0.42, by - 32], [cx + bw * 0.5 + 14, by + 26]], 17, 11));
  }
  parts.push(RR(d(6), cx - 19, by + bh / 2 + 26, 16, 56, 7));
  parts.push(RR(d(7), cx + 19, by + bh / 2 + 26, 16, 56, 7));
  if (s.wings) {
    parts.push(E(d(8), cx - bw * 0.8, by - 6, 62, 26, 22));
    parts.push(E(d(9), cx + bw * 0.8, by - 6, 62, 26, -22));
  }
  if (s.halo) parts.push(E(d(10), cx, hy - hr * 2.2, hr * 1.05, hr * 0.2));
  if (s.beard) parts.push(E(d(11), cx, hy + hr * 0.72, hr * 0.8, hr * 0.62));
  return parts;
}

/* ------------------------------------------------------------------ */
/* 식물                                                                */
/* ------------------------------------------------------------------ */

export type PlantSpec = {
  seed: number;
  kind: "tree" | "pine" | "flower" | "sunflower" | "tulip" | "mushroom" | "cactus" | "palm" | "leaf" | "bamboo" | "mountain";
  cx?: number;
  cy?: number;
  scale?: number;
};

export function plant(s: PlantSpec): Part[] {
  const d = D(s.seed);
  const cx = s.cx ?? 300;
  const cy = s.cy ?? 210;
  const k = s.scale ?? 1;
  const parts: Part[] = [];
  switch (s.kind) {
    case "tree":
      parts.push(RIB(d(0), [[cx, cy + 120], [cx - 4, cy + 40], [cx, cy - 10]], 34 * k, 20 * k));
      parts.push(C(d(1), cx - 44 * k, cy - 66 * k, 62 * k));
      parts.push(C(d(2), cx + 46 * k, cy - 62 * k, 58 * k));
      parts.push(C(d(3), cx, cy - 108 * k, 70 * k));
      parts.push(C(d(4), cx + 6 * k, cy - 48 * k, 66 * k));
      break;
    case "pine":
      parts.push(RIB(d(0), [[cx, cy + 130], [cx, cy + 60]], 30 * k, 22 * k));
      parts.push(P(d(1), cx - 78 * k, cy + 70 * k, cx + 78 * k, cy + 70 * k, cx, cy - 4 * k));
      parts.push(P(d(2), cx - 64 * k, cy + 16 * k, cx + 64 * k, cy + 16 * k, cx, cy - 50 * k));
      parts.push(P(d(3), cx - 48 * k, cy - 42 * k, cx + 48 * k, cy - 42 * k, cx, cy - 104 * k));
      break;
    case "flower":
    case "tulip":
    case "sunflower": {
      const headY = s.kind === "sunflower" ? cy - 30 * k : cy - 60 * k;
      parts.push(RIB(d(0), [[cx, cy + 130], [cx + 6 * k, cy + 30], [cx, headY + 26 * k]], 13 * k, 13 * k));
      parts.push(E(d(1), cx - 40 * k, cy + 60 * k, 34 * k, 15 * k, -24));
      if (s.kind === "tulip") {
        parts.push(P(d(2), cx - 44 * k, headY - 10 * k, cx - 44 * k, headY - 58 * k, cx - 16 * k, headY - 26 * k));
        parts.push(P(d(3), cx + 44 * k, headY - 10 * k, cx + 44 * k, headY - 58 * k, cx + 16 * k, headY - 26 * k));
        parts.push(P(d(4), cx - 40 * k, headY - 6 * k, cx, headY - 44 * k, cx + 40 * k, headY - 6 * k, cx, headY + 24 * k));
      } else {
        const n = s.kind === "sunflower" ? 12 : 6;
        const pr = s.kind === "sunflower" ? 30 * k : 20 * k;
        const pl = s.kind === "sunflower" ? 46 * k : 40 * k;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          parts.push(E(d(2 + i), cx + Math.cos(a) * pl * 0.8, headY + Math.sin(a) * pl * 0.8, pl * 0.55, pr * 0.55, (a * 180) / Math.PI + 90));
        }
        parts.push(C(d(20), cx, headY, pr));
      }
      break;
    }
    case "mushroom":
      parts.push(E(d(0), cx, cy + 60 * k, 26 * k, 46 * k));
      parts.push(E(d(1), cx, cy - 10 * k, 96 * k, 58 * k));
      parts.push(P(d(2), cx - 96 * k, cy - 12 * k, cx, cy - 24 * k, cx + 96 * k, cy - 12 * k, cx + 84 * k, cy + 46 * k, cx - 84 * k, cy + 46 * k));
      break;
    case "cactus":
      parts.push(RR(d(0), cx, cy + 20 * k, 54 * k, 190 * k, 26 * k));
      parts.push(RR(d(1), cx - 62 * k, cy - 20 * k, 34 * k, 82 * k, 17 * k));
      parts.push(RR(d(2), cx + 64 * k, cy + 6 * k, 34 * k, 92 * k, 17 * k));
      parts.push(RIB(d(3), [[cx - 62 * k, cy - 56 * k], [cx - 30 * k, cy - 60 * k]], 30 * k, 30 * k));
      parts.push(RIB(d(4), [[cx + 64 * k, cy - 40 * k], [cx + 32 * k, cy - 44 * k]], 30 * k, 30 * k));
      break;
    case "palm":
      parts.push(RIB(d(0), [[cx - 10 * k, cy + 130], [cx + 4 * k, cy + 40], [cx + 16 * k, cy - 40]], 30 * k, 20 * k));
      for (let i = 0; i < 5; i++) {
        const a = (-160 + i * 80) * (Math.PI / 180);
        parts.push(
          RIB(d(1 + i), [[cx + 16 * k, cy - 42 * k], [cx + 16 * k + Math.cos(a) * 70 * k, cy - 42 * k + Math.sin(a) * 56 * k], [cx + 16 * k + Math.cos(a) * 118 * k, cy - 42 * k + Math.sin(a) * 104 * k + 34 * k]], 20 * k, 4 * k),
        );
      }
      parts.push(C(d(8), cx + 10 * k, cy - 30 * k, 14 * k));
      break;
    case "leaf":
      parts.push(E(d(0), cx, cy - 20 * k, 74 * k, 104 * k, 18));
      parts.push(RIB(d(1), [[cx - 60 * k, cy + 74 * k], [cx, cy - 110 * k]], 8 * k, 3 * k));
      parts.push(RIB(d(2), [[cx - 40 * k, cy + 26 * k], [cx + 44 * k, cy - 66 * k]], 5 * k, 2 * k));
      break;
    case "bamboo":
      parts.push(RIB(d(0), [[cx - 60, cy + 140], [cx - 52, cy - 120]], 22, 22));
      parts.push(RIB(d(1), [[cx + 40, cy + 150], [cx + 46, cy - 60]], 22, 22));
      parts.push(RIB(d(2), [[cx + 12, cy + 60], [cx + 16, cy - 170]], 20, 20));
      parts.push(E(d(3), cx - 20, cy - 120, 46, 10, -22));
      parts.push(E(d(4), cx + 60, cy - 66, 44, 10, -16));
      break;
    case "mountain":
      parts.push(P(d(0), cx - 190, cy + 120, cx - 40, cy - 92, cx + 90, cy + 120));
      parts.push(P(d(1), cx - 20, cy + 120, cx + 96, cy - 50, cx + 200, cy + 120));
      parts.push(C(d(2), cx + 130, cy - 108, 34));
      parts.push(RIB(d(3), [[cx - 40, cy - 92], [cx - 8, cy - 40], [cx + 22, cy - 92]], 26, 10));
      break;
  }
  return parts;
}
