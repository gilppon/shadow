import { backProjectPoly, clamp, type Light, type Pt } from "./geometry";
import { CATALOG, type Category } from "./catalog";
import type { Part } from "./parts";

export type LevelSpec = {
  id: string;
  index: number;
  name: string;
  emoji: string;
  category: Category;
  advice: string;
  solution: Light;
  start: Light;
  tolerance: number;
  design: Part[];
};

export type Piece = { obj: Pt[]; design: Pt[]; z: number };

export type Level = {
  spec: LevelSpec;
  pieces: Piece[];
  /** 목표 실루엣(벽 좌표) */
  target: Pt[][];
  bounds: { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number };
  minZ: number;
};

const X0 = 70;
const X1 = 530;
const Y0 = 40;
const Y1 = 360;

function buildLevel(spec: LevelSpec): Level {
  const pieces: Piece[] = spec.design.map((d) => ({
    z: d.z,
    design: d.pts,
    obj: backProjectPoly(d.pts, d.z, spec.solution),
  }));
  const minZ = Math.min(...spec.design.map((d) => d.z));
  return {
    spec,
    pieces,
    target: spec.design.map((d) => d.pts),
    minZ,
    bounds: { x0: X0, x1: X1, y0: Y0, y1: Y1, z0: -110, z1: minZ - 20 },
  };
}

export function clampLight(l: Light, level: Level): Light {
  const b = level.bounds;
  return {
    x: clamp(l.x, b.x0, b.x1),
    y: clamp(l.y, b.y0, b.y1),
    z: clamp(l.z, b.z0, b.z1),
  };
}

export function buildLevels(): Level[] {
  return CATALOG.map((c) => buildLevel(c as LevelSpec));
}

export type LevelProgress = {
  solved: boolean;
  best: number;
  time: number;
  hints: number;
};
