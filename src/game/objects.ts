import { dpt, C, E, P, RIB, RR, STAR, type Part } from "./parts";

export type Builder = (seed: number) => Part[];
const dd = (seed: number) => (i: number) => dpt(seed, i);

/* 사물 -------------------------------------------------------------- */

export const rocket: Builder = (s) => {
  const d = dd(s);
  return [
    E(d(0), 300, 216, 44, 92),
    P(d(1), 257, 146, 343, 146, 300, 74),
    P(d(2), 262, 236, 222, 326, 270, 300),
    P(d(3), 338, 236, 378, 326, 330, 300),
    C(d(4), 300, 176, 20),
    P(d(5), 300, 306, 276, 372, 300, 352, 324, 372),
  ];
};

export const mug: Builder = (s) => {
  const d = dd(s);
  return [
    RR(d(0), 286, 208, 132, 122, 16),
    E(d(1), 372, 200, 32, 42),
    RIB(d(2), [[272, 140], [262, 108], [278, 84]], 12, 6),
    RIB(d(3), [[300, 138], [292, 106], [308, 82]], 12, 6),
  ];
};

export const umbrella: Builder = (s) => {
  const d = dd(s);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 26; i++) {
    const a = Math.PI - (i / 26) * Math.PI;
    pts.push([300 + Math.cos(a) * 132, 186 + Math.sin(a) * 108]);
  }
  return [
    { z: d(0), pts },
    RIB(d(1), [[300, 186], [300, 62]], 10, 6),
    RIB(d(2), [[300, 292], [288, 340], [316, 352]], 13, 8),
    RIB(d(3), [[190, 196], [300, 258], [410, 196]], 6, 6),
  ];
};

export const key: Builder = (s) => {
  const d = dd(s);
  return [
    C(d(0), 232, 178, 44),
    RIB(d(1), [[266, 196], [424, 262]], 22, 22),
    P(d(2), 386, 250, 424, 262, 418, 300),
    P(d(3), 356, 238, 394, 252, 388, 288),
    C(d(4), 232, 178, 16),
  ];
};

export const scissors: Builder = (s) => {
  const d = dd(s);
  return [
    RIB(d(0), [[318, 208], [232, 96]], 20, 7),
    RIB(d(1), [[318, 208], [404, 96]], 20, 7),
    E(d(2), 218, 288, 40, 30, -28),
    E(d(3), 418, 288, 40, 30, 28),
    RIB(d(4), [[244, 264], [312, 214]], 15, 8),
    RIB(d(5), [[392, 264], [324, 214]], 15, 8),
    C(d(6), 318, 208, 12),
  ];
};

export const bulb: Builder = (s) => {
  const d = dd(s);
  return [
    C(d(0), 300, 172, 62),
    RR(d(1), 300, 236, 56, 44, 10),
    RR(d(2), 300, 268, 70, 22, 8),
    RIB(d(3), [[282, 196], [292, 226], [300, 240]], 7, 5),
    RIB(d(4), [[318, 196], [308, 226], [300, 240]], 7, 5),
    RIB(d(5), [[300, 62], [300, 20]], 8, 3),
    RIB(d(6), [[212, 100], [176, 64]], 8, 3),
    RIB(d(7), [[388, 100], [424, 64]], 8, 3),
  ];
};

export const clock: Builder = (s) => {
  const d = dd(s);
  return [
    C(d(0), 300, 202, 96),
    RIB(d(1), [[300, 202], [300, 138]], 12, 8),
    RIB(d(2), [[300, 202], [346, 226]], 12, 8),
    C(d(3), 300, 202, 9),
    C(d(4), 216, 112, 26),
    C(d(5), 384, 112, 26),
    RIB(d(6), [[248, 288], [232, 330]], 14, 10),
    RIB(d(7), [[352, 288], [368, 330]], 14, 10),
  ];
};

export const glasses: Builder = (s) => {
  const d = dd(s);
  return [
    C(d(0), 226, 196, 58),
    C(d(1), 374, 196, 58),
    RIB(d(2), [[282, 188], [318, 188]], 12, 12),
    RIB(d(3), [[170, 182], [126, 156]], 11, 8),
    RIB(d(4), [[430, 182], [474, 156]], 11, 8),
  ];
};

export const pencil: Builder = (s) => {
  const d = dd(s);
  return [
    P(d(0), 236, 116, 372, 62, 396, 108, 260, 162),
    P(d(1), 396, 108, 442, 122, 404, 160),
    RR(d(2), 220, 132, 36, 62, 6),
    P(d(3), 236, 116, 204, 104, 220, 132),
    P(d(4), 224, 158, 262, 146, 256, 176),
  ];
};

export const car: Builder = (s) => {
  const d = dd(s);
  return [
    P(d(0), 174, 268, 194, 218, 246, 212, 288, 158, 372, 156, 412, 214, 452, 224, 456, 268),
    P(d(1), 292, 168, 306, 214, 374, 212, 366, 168),
    C(d(2), 234, 274, 34),
    C(d(3), 392, 274, 34),
    C(d(4), 234, 274, 14),
    C(d(5), 392, 274, 14),
    P(d(6), 456, 232, 486, 246, 456, 254),
  ];
};

export const sailboat: Builder = (s) => {
  const d = dd(s);
  return [
    P(d(0), 178, 288, 424, 288, 388, 336, 214, 336),
    RIB(d(1), [[300, 284], [300, 92]], 13, 13),
    P(d(2), 310, 108, 310, 276, 402, 276),
    P(d(3), 290, 124, 290, 276, 210, 276),
    P(d(4), 210, 276, 402, 276, 300, 296),
  ];
};

export const house: Builder = (s) => {
  const d = dd(s);
  return [
    RR(d(0), 300, 244, 176, 128, 8),
    P(d(1), 194, 186, 406, 186, 300, 100),
    RR(d(2), 300, 268, 56, 82, 6),
    RR(d(3), 358, 172, 26, 60, 4),
    C(d(4), 262, 218, 24),
    P(d(5), 194, 186, 300, 100, 406, 186, 300, 200),
  ];
};

export const lighthouse: Builder = (s) => {
  const d = dd(s);
  return [
    P(d(0), 246, 336, 354, 336, 330, 168, 270, 168),
    P(d(1), 258, 288, 342, 288, 338, 258, 262, 258),
    P(d(2), 264, 216, 336, 216, 332, 188, 268, 188),
    RR(d(3), 300, 156, 76, 30, 6),
    P(d(4), 258, 142, 342, 142, 300, 96),
    C(d(5), 300, 156, 17),
    RIB(d(6), [[300, 150], [216, 118]], 10, 4),
    RIB(d(7), [[300, 150], [384, 118]], 10, 4),
  ];
};

export const anchor: Builder = (s) => {
  const d = dd(s);
  return [
    C(d(0), 300, 96, 34),
    RIB(d(1), [[300, 130], [300, 300]], 26, 22),
    RIB(d(2), [[236, 168], [364, 168]], 22, 22),
    RIB(d(3), [[300, 296], [212, 250], [230, 190]], 24, 8),
    RIB(d(4), [[300, 296], [388, 250], [370, 190]], 24, 8),
  ];
};

export const crown: Builder = (s) => {
  const d = dd(s);
  return [
    P(d(0), 208, 250, 392, 250, 392, 148, 348, 196, 300, 120, 252, 196, 208, 148),
    RR(d(1), 300, 262, 196, 34, 10),
    C(d(2), 300, 106, 17),
    C(d(3), 208, 138, 15),
    C(d(4), 392, 138, 15),
  ];
};

export const bell: Builder = (s) => {
  const d = dd(s);
  return [
    P(d(0), 216, 244, 384, 244, 366, 148, 300, 108, 234, 148),
    P(d(1), 216, 244, 384, 244, 384, 274, 216, 274),
    C(d(2), 300, 292, 22),
    C(d(3), 300, 92, 17),
    RIB(d(4), [[246, 236], [230, 300]], 12, 8),
    RIB(d(5), [[354, 236], [370, 300]], 12, 8),
  ];
};

/* 기호 -------------------------------------------------------------- */

export const heart: Builder = (s) => {
  const d = dd(s);
  return [
    C(d(0), 264, 172, 46),
    C(d(1), 336, 172, 46),
    P(d(2), 220, 190, 380, 190, 300, 310),
    E(d(3), 300, 130, 20, 26, 0),
  ];
};

export const star: Builder = (s) => {
  const d = dd(s);
  return [STAR(d(0), 300, 200, 130, 54, 5), C(d(1), 300, 200, 26)];
};

export const moon: Builder = (s) => {
  const d = dd(s);
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];
  const r = 116;
  for (let i = 0; i <= 22; i++) {
    const a = Math.PI * 0.62 + (i / 22) * (Math.PI * 1.06);
    outer.push([300 + Math.cos(a) * r, 200 + Math.sin(a) * r]);
  }
  for (let i = 22; i >= 0; i--) {
    const a = Math.PI * 0.62 + (i / 22) * (Math.PI * 1.06);
    inner.push([330 + Math.cos(a) * r * 0.86, 196 + Math.sin(a) * r * 0.86]);
  }
  return [{ z: d(0), pts: outer.concat(inner) }, C(d(1), 236, 262, 22)];
};

export const sun: Builder = (s) => {
  const d = dd(s);
  const parts: Part[] = [C(d(0), 300, 200, 76)];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    parts.push(
      RIB(d(1 + i), [[300 + Math.cos(a) * 92, 200 + Math.sin(a) * 92], [300 + Math.cos(a) * 142, 200 + Math.sin(a) * 142]], 20, 4),
    );
  }
  return parts;
};

export const note: Builder = (s) => {
  const d = dd(s);
  return [
    E(d(0), 268, 300, 40, 30, -18),
    RIB(d(1), [[300, 292], [300, 118]], 14, 12),
    P(d(2), 300, 118, 372, 146, 372, 190, 300, 162),
    C(d(3), 386, 128, 22),
  ];
};

export const balloon: Builder = (s) => {
  const d = dd(s);
  return [
    E(d(0), 300, 162, 68, 82),
    P(d(1), 300, 248, 282, 268, 318, 268),
    RIB(d(2), [[300, 268], [316, 320], [288, 372]], 9, 5),
    E(d(3), 268, 132, 22, 32, 24),
  ];
};

export const gift: Builder = (s) => {
  const d = dd(s);
  return [
    RR(d(0), 300, 252, 200, 130, 10),
    RR(d(1), 300, 178, 224, 34, 8),
    RR(d(2), 300, 244, 34, 138, 6),
    E(d(3), 258, 148, 42, 22, 30),
    E(d(4), 342, 148, 42, 22, -30),
    C(d(5), 300, 152, 18),
  ];
};

export const dice: Builder = (s) => {
  const d = dd(s);
  return [
    RR(d(0), 300, 200, 172, 172, 30),
    C(d(1), 246, 146, 20),
    C(d(2), 354, 254, 20),
    C(d(3), 246, 254, 20),
    C(d(4), 354, 146, 20),
    C(d(5), 300, 200, 26),
  ];
};

/* 음식 -------------------------------------------------------------- */

export const apple: Builder = (s) => {
  const d = dd(s);
  return [
    E(d(0), 300, 214, 84, 78),
    C(d(1), 262, 196, 40),
    C(d(2), 338, 196, 40),
    RIB(d(3), [[300, 140], [312, 96]], 13, 8),
    E(d(4), 342, 106, 42, 20, -24),
  ];
};

export const banana: Builder = (s) => {
  const d = dd(s);
  const path: [number, number][] = [];
  for (let i = 0; i <= 18; i++) {
    const a = Math.PI * 0.12 + (i / 18) * (Math.PI * 1.1);
    path.push([214 + Math.cos(a) * 128, 300 - Math.sin(a) * 132]);
  }
  return [
    { z: d(0), pts: path.map((p) => [p[0], p[1]]) } as Part,
    P(d(1), 206, 320, 236, 300, 214, 288),
    P(d(2), 330, 168, 352, 146, 334, 174),
  ];
};

export const bananaCurve: Builder = (s) => {
  const d = dd(s);
  const path: [number, number][] = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * 0.15 + (i / 16) * (Math.PI * 1.0);
    path.push([216 + Math.cos(a) * 124, 296 - Math.sin(a) * 126]);
  }
  return [
    RIB(d(0), path, 44, 26),
    P(d(1), 208, 314, 240, 296, 216, 284),
    P(d(2), 328, 172, 350, 150, 330, 178),
  ];
};

export const strawberry: Builder = (s) => {
  const d = dd(s);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 24; i++) {
    const a = -Math.PI / 2 + (i / 24) * Math.PI * 1.72;
    const r = 104;
    pts.push([300 + Math.cos(a) * r * 1.0, 218 + Math.sin(a) * r * 1.12]);
  }
  pts.push([300, 336]);
  return [
    { z: d(0), pts },
    P(d(1), 258, 124, 342, 124, 322, 158, 278, 158),
    RIB(d(2), [[300, 116], [300, 76]], 12, 8),
    C(d(3), 268, 200, 12),
    C(d(4), 334, 214, 12),
    C(d(5), 300, 264, 12),
  ];
};

export const grape: Builder = (s) => {
  const d = dd(s);
  return [
    C(d(0), 300, 176, 34),
    C(d(1), 256, 216, 34),
    C(d(2), 344, 216, 34),
    C(d(3), 278, 262, 34),
    C(d(4), 322, 262, 34),
    C(d(5), 300, 308, 34),
    RIB(d(6), [[300, 142], [312, 92]], 13, 8),
    E(d(7), 348, 100, 44, 20, -22),
  ];
};

export const watermelon: Builder = (s) => {
  const d = dd(s);
  const outer: [number, number][] = [[180, 216]];
  for (let i = 0; i <= 24; i++) {
    const a = Math.PI + (i / 24) * Math.PI;
    outer.push([300 + Math.cos(a) * 124, 216 + Math.sin(a) * 124]);
  }
  const inner: [number, number][] = [];
  for (let i = 24; i >= 0; i--) {
    const a = Math.PI + (i / 24) * Math.PI;
    inner.push([300 + Math.cos(a) * 96, 216 + Math.sin(a) * 96]);
  }
  return [
    { z: d(0), pts: outer.concat(inner) },
    P(d(1), 300, 216, 424, 216, 420, 246, 180, 246),
    C(d(2), 264, 258, 11),
    C(d(3), 336, 254, 11),
    C(d(4), 300, 288, 11),
  ];
};

export const icecream: Builder = (s) => {
  const d = dd(s);
  return [
    P(d(0), 236, 232, 364, 232, 300, 350),
    E(d(1), 300, 196, 66, 52),
    C(d(2), 258, 148, 42),
    C(d(3), 342, 148, 42),
    C(d(4), 300, 96, 40),
    P(d(5), 300, 56, 312, 78, 288, 78),
  ];
};

export const cake: Builder = (s) => {
  const d = dd(s);
  return [
    RR(d(0), 300, 292, 216, 82, 12),
    RR(d(1), 300, 232, 178, 56, 10),
    RR(d(2), 300, 190, 140, 42, 10),
    RIB(d(3), [[272, 168], [272, 128]], 11, 11),
    RIB(d(4), [[300, 168], [300, 118]], 11, 11),
    RIB(d(5), [[328, 168], [328, 128]], 11, 11),
    P(d(6), 300, 96, 312, 118, 288, 118),
    C(d(7), 272, 106, 9),
    C(d(8), 328, 106, 9),
  ];
};

export const donut: Builder = (s) => {
  const d = dd(s);
  const ring: [number, number][] = [];
  const back: [number, number][] = [];
  const r = 104;
  const w = 34;
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    ring.push([300 + Math.cos(a) * (r + w / 2), 200 + Math.sin(a) * (r + w / 2)]);
    back.push([300 + Math.cos(a) * (r - w / 2), 200 + Math.sin(a) * (r - w / 2)]);
  }
  return [
    { z: d(0), pts: ring.concat(back.reverse()) },
    E(d(1), 236, 132, 40, 24, -30),
    E(d(2), 366, 268, 40, 24, 30),
    C(d(3), 300, 96, 15),
  ];
};

export const snowman: Builder = (s) => {
  const d = dd(s);
  return [
    C(d(0), 300, 296, 78),
    C(d(1), 300, 196, 58),
    C(d(2), 300, 116, 44),
    P(d(3), 258, 84, 342, 84, 316, 40, 276, 40),
    RR(d(4), 300, 80, 74, 14, 5),
    RIB(d(5), [[244, 186], [186, 146]], 12, 8),
    RIB(d(6), [[356, 186], [414, 146]], 12, 8),
    P(d(7), 344, 112, 372, 122, 344, 128),
  ];
};

export const shadeAgent: Builder = (s) => {
  const d = dd(s);
  return [
    E(d(0), 300, 118, 35, 33),
    P(d(1), 271, 149, 329, 149, 318, 252, 282, 252),
    P(d(2), 272, 156, 218, 198, 227, 215, 275, 176),
    P(d(3), 328, 156, 384, 137, 389, 154, 331, 181),
    P(d(4), 284, 249, 271, 332, 289, 334, 297, 251),
    P(d(5), 303, 251, 315, 334, 333, 332, 318, 249),
    P(d(6), 300, 132, 334, 144, 300, 156, 266, 144),
    RR(d(7), 288, 356, 74, 14, 7),
  ];
};
