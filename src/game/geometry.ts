/**
 * 그림자 각도 맞추기 - 핵심 기하학 엔진
 *
 * 좌표계
 *  - x : 좌우 (wall 좌표와 동일한 척도, 0 ~ 600)
 *  - y : 상하 (0 ~ 400)
 *  - z : 깊이. 조명(z = light.z) → 오브젝트(조각들) → 벽(z = Z_WALL) 순서.
 *
 * 오브젝트는 "평면 종이 쿠폰" 처럼 특정 깊이 z 에 놓인 2D 다각형들로 구성된다.
 * 조명 위치를 옮기면 깊이가 다른 조각들이 서로 다른 비율로 밀려나(시차) 그림자 형태가 변한다.
 */

export const Z_WALL = 100;

export type Pt = [number, number];
export type Light = { x: number; y: number; z: number };

/** 조명에서 본 깊이 z 평면의 확대/축소 비율 */
export function scaleT(z: number, l: Light): number {
  return (Z_WALL - l.z) / (z - l.z);
}

/** 오브젝트 좌표 → 벽 좌표 (그림자) */
export function projectPoly(poly: Pt[], z: number, l: Light): Pt[] {
  const t = scaleT(z, l);
  const dx = (1 - t) * l.x;
  const dy = (1 - t) * l.y;
  return poly.map(([x, y]) => [x * t + dx, y * t + dy] as Pt);
}

/** 벽 좌표(설계도) → 오브젝트 좌표. 설계된 실루엣을 실제 조각으로 만든다. */
export function backProjectPoly(poly: Pt[], z: number, l: Light): Pt[] {
  const t = scaleT(z, l);
  return poly.map(([px, py]) => [l.x + (px - l.x) / t, l.y + (py - l.y) / t] as Pt);
}

/* ------------------------------------------------------------------ */
/* 도형 생성 헬퍼                                                      */
/* ------------------------------------------------------------------ */

export function ellipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  n = 34,
  rotDeg = 0,
): Pt[] {
  const rot = (rotDeg * Math.PI) / 180;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return pts;
}

/** 둥근 사각형 */
export function rrect(cx: number, cy: number, w: number, h: number, r = 4): Pt[] {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy - h / 2;
  const y1 = cy + h / 2;
  const rr = Math.min(r, w / 2, h / 2);
  const pts: Pt[] = [];
  const seg = (ax: number, ay: number, bx: number, by: number, n = 6) => {
    for (let i = 0; i <= n; i++) pts.push([ax + (bx - ax) * (i / n), ay + (by - ay) * (i / n)]);
  };
  const arc = (ox: number, oy: number, a0: number, a1: number, n = 6) => {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * (i / n);
      pts.push([ox + Math.cos(a) * rr, oy + Math.sin(a) * rr]);
    }
  };
  seg(x0 + rr, y0, x1 - rr, y0);
  arc(x1 - rr, y0 + rr, -Math.PI / 2, 0);
  seg(x1, y0 + rr, x1, y1 - rr);
  arc(x1 - rr, y1 - rr, 0, Math.PI / 2);
  seg(x1 - rr, y1, x0 + rr, y1);
  arc(x0 + rr, y1 - rr, Math.PI / 2, Math.PI);
  seg(x0, y1 - rr, x0, y0 + rr);
  arc(x0 + rr, y0 + rr, Math.PI, 1.5 * Math.PI);
  return pts;
}

export function poly(...pts: [number, number][]): Pt[] {
  return pts;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function toPath(p: Pt[]): string {
  if (!p.length) return "";
  let d = `M${r2(p[0][0])} ${r2(p[0][1])}`;
  for (let i = 1; i < p.length; i++) d += `L${r2(p[i][0])} ${r2(p[i][1])}`;
  return d + "Z";
}

export function centroid(p: Pt[]): Pt {
  let x = 0;
  let y = 0;
  for (const [a, b] of p) {
    x += a;
    y += b;
  }
  return [x / p.length, y / p.length];
}

/** 볼록 껍질 (광선 그리기용) */
export function convexHull(points: Pt[]): Pt[] {
  if (points.length < 4) return points.slice();
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Pt[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Pt[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
