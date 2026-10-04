import type { Pt } from "./geometry";

/**
 * 두 다각형 집합(그림자 vs 목표 실루엣)을 저해상도 캔버스에 래스터라이즈해서
 * 픽셀 단위 IoU(교집합/합집합)를 계산한다.
 */
const RES = 0.25; // 600x400 -> 150x100
const W = Math.round(600 * RES);
const H = Math.round(400 * RES);

let canvasA: HTMLCanvasElement | null = null;
let canvasB: HTMLCanvasElement | null = null;

function getCanvas(which: 0 | 1): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  const store = which === 0 ? () => (canvasA ??= document.createElement("canvas")) : () => (canvasB ??= document.createElement("canvas"));
  const c = store();
  if (c.width !== W) {
    c.width = W;
    c.height = H;
  }
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.scale(RES, RES);
  return ctx;
}

function drawSet(ctx: CanvasRenderingContext2D, set: Pt[][]) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  for (const p of set) {
    if (!p.length) continue;
    ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
    ctx.closePath();
  }
  ctx.fill();
}

function countPixels(ctx: CanvasRenderingContext2D): Uint8Array | null {
  const data = ctx.getImageData(0, 0, W, H).data;
  const out = new Uint8Array(W * H);
  for (let i = 0; i < out.length; i++) out[i] = data[i * 4 + 3] > 40 ? 1 : 0;
  return out;
}

export type MatchResult = {
  iou: number;
  /** 화면에 표시용 점수 (0~100) */
  score: number;
};

export function computeMatch(shadow: Pt[][], target: Pt[][]): MatchResult {
  const a = getCanvas(0);
  const b = getCanvas(1);
  if (!a || !b) return { iou: 0, score: 0 };
  drawSet(a, shadow);
  drawSet(b, target);
  const pa = countPixels(a);
  const pb = countPixels(b);
  if (!pa || !pb) return { iou: 0, score: 0 };
  let both = 0;
  let onlyA = 0;
  let onlyB = 0;
  for (let i = 0; i < pa.length; i++) {
    const x = pa[i];
    const y = pb[i];
    if (x && y) both++;
    else if (x) onlyA++;
    else if (y) onlyB++;
  }
  const union = both + onlyA + onlyB;
  if (union === 0) return { iou: 0, score: 0 };
  const iou = both / union;
  // 조금 더 관대하게 보정 (게임 느낌)
  const score = Math.min(1, (iou - 0.15) / 0.85);
  return { iou, score: Math.max(0, score) };
}
