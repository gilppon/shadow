import { clamp, type Light } from "./geometry";
import { C, STAR, bird, bug, fish, person, plant, quad, type Part } from "./parts";
import { dpt } from "./parts";
import * as O from "./objects";

export type Category =
  | "새"
  | "동물"
  | "바다"
  | "곤충"
  | "자연"
  | "사물"
  | "기호"
  | "음식"
  | "캐릭터";

export const CATEGORIES: Category[] = [
  "새",
  "동물",
  "바다",
  "곤충",
  "자연",
  "사물",
  "기호",
  "음식",
  "캐릭터",
];

export const CATEGORY_ICON: Record<Category, string> = {
  새: "🐦",
  동물: "🐾",
  바다: "🐙",
  곤충: "🦋",
  자연: "🌿",
  사물: "🔑",
  기호: "⭐",
  음식: "🍓",
  캐릭터: "🥷",
};

type Entry = { name: string; emoji: string; cat: Category; build: (seed: number) => Part[] };

/* ------------------------------------------------------------------ */
/* 100개의 그림자 목록                                                   */
/* ------------------------------------------------------------------ */

const ENTRIES: Entry[] = [
  /* ---- 새 (12) ---- */
  { name: "아침의 새", emoji: "🐦", cat: "새", build: (s) => bird({ seed: s, bodyRx: 74, bodyRy: 46, beakLen: 32, tailLen: 80, tailAng: -24, legs: 54, wing: 46 }) },
  { name: "학", emoji: "🦢", cat: "새", build: (s) => bird({ seed: s, bodyRx: 70, bodyRy: 42, neck: 74, headR: 19, beakLen: 44, tailLen: 56, tailAng: -8, legs: 86, wing: 40 }) },
  { name: "독수리", emoji: "🦅", cat: "새", build: (s) => bird({ seed: s, bodyRx: 88, bodyRy: 44, bodyRot: -10, headR: 24, beakLen: 26, beakH: 16, tailLen: 54, tailAng: 8, wing: 86, wingRot: -28, legs: 34 }) },
  { name: "펭귄", emoji: "🐧", cat: "새", build: (s) => bird({ seed: s, upright: true, bodyRx: 58, bodyRy: 104, bodyRot: 0, headR: 32, neck: 0, beakLen: 24, tailLen: 0, legs: 18, wing: 20, wingRot: -42 }) },
  { name: "오리", emoji: "🦆", cat: "새", build: (s) => bird({ seed: s, bodyRx: 72, bodyRy: 44, bodyRot: -8, headR: 24, neck: 16, beakLen: 40, beakH: 11, tailLen: 52, tailAng: 26, wing: 42 }) },
  { name: "공작새", emoji: "🦚", cat: "새", build: (s) => bird({ seed: s, bodyRx: 64, bodyRy: 46, headR: 22, neck: 22, beakLen: 26, tailLen: 0, fan: 7, legs: 44, wing: 34 }) },
  { name: "부엉이", emoji: "🦉", cat: "새", build: (s) => bird({ seed: s, bodyRx: 66, bodyRy: 72, bodyRot: 0, headR: 38, neck: 0, beakLen: 20, beakH: 14, tailLen: 42, tailAng: 12, wing: 44, legs: 20, crest: 26 }) },
  { name: "갈매기", emoji: "🕊️", cat: "새", build: (s) => bird({ seed: s, bodyRx: 78, bodyRy: 36, bodyRot: -6, headR: 20, neck: 12, beakLen: 34, beakH: 9, tailLen: 44, wing: 78, wingRot: -22, legs: 24 }) },
  { name: "타조", emoji: "🪶", cat: "새", build: (s) => bird({ seed: s, bodyRx: 66, bodyRy: 56, bodyRot: -16, headR: 20, neck: 62, beakLen: 22, tailLen: 62, tailAng: -40, legs: 96, wing: 52 }) },
  { name: "앵무새", emoji: "🦜", cat: "새", build: (s) => bird({ seed: s, bodyRx: 56, bodyRy: 76, bodyRot: -12, headR: 30, neck: 10, beakLen: 30, beakH: 20, tailLen: 86, tailAng: -30, crest: 22, legs: 26 }) },
  { name: "제비", emoji: "🐦‍⬛", cat: "새", build: (s) => bird({ seed: s, bodyRx: 64, bodyRy: 34, bodyRot: -14, headR: 17, neck: 6, beakLen: 14, tailLen: 74, tailAng: -34, wing: 70, wingRot: -30 }) },
  { name: "두루미", emoji: "🕊", cat: "새", build: (s) => bird({ seed: s, bodyRx: 72, bodyRy: 38, headR: 19, neck: 64, beakLen: 46, tailLen: 44, tailAng: -6, legs: 92, wing: 34 }) },

  /* ---- 동물 (19) ---- */
  { name: "고양이", emoji: "🐈", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 92, bodyRy: 52, headR: 30, snout: 18, ear: "point", earLen: 36, tail: "thin", tailLen: 78, legLen: 56 }) },
  { name: "강아지", emoji: "🐕", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 88, bodyRy: 50, headR: 29, snout: 26, ear: "point", earLen: 30, earW: 17, tail: "up", tailLen: 56, legLen: 52 }) },
  { name: "토끼", emoji: "🐰", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 80, bodyRy: 50, headR: 26, ear: "long", earLen: 78, earW: 15, snout: 12, tail: "stub", tailLen: 22, legLen: 46 }) },
  { name: "다람쥐", emoji: "🐿️", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 62, bodyRy: 44, headR: 24, ear: "point", earLen: 24, tail: "up", tailLen: 96, snout: 10, legLen: 30, legW: 11 }) },
  { name: "곰", emoji: "🐻", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 96, bodyRy: 60, headR: 38, snout: 20, ear: "round", earW: 21, tail: "none", legLen: 44, legW: 24 }) },
  { name: "늑대", emoji: "🐺", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 92, bodyRy: 48, headR: 27, snout: 32, ear: "point", earLen: 32, tail: "bushy", tailLen: 70, legLen: 58 }) },
  { name: "여우", emoji: "🦊", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 80, bodyRy: 46, headR: 26, snout: 34, ear: "point", earLen: 44, earW: 16, tail: "bushy", tailLen: 88, legLen: 44, legW: 12 }) },
  { name: "사자", emoji: "🦁", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 92, bodyRy: 52, headR: 30, ear: "mane", snout: 20, tail: "thin", tailLen: 76, legLen: 56 }) },
  { name: "호랑이", emoji: "🐯", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 96, bodyRy: 50, headR: 29, snout: 22, ear: "round", earW: 16, tail: "thin", tailLen: 82, legLen: 54 }) },
  { name: "소", emoji: "🐄", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 100, bodyRy: 58, headR: 32, snout: 24, ear: "horn", earLen: 26, tail: "thin", tailLen: 60, legLen: 48, legW: 20 }) },
  { name: "말", emoji: "🐎", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 104, bodyRy: 50, headR: 26, neck: 34, snout: 30, ear: "point", earLen: 34, mane: 1, tail: "thin", tailLen: 80, legLen: 74, legW: 13 }) },
  { name: "양", emoji: "🐑", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 86, bodyRy: 56, headR: 24, snout: 16, ear: "horn", earLen: 34, tail: "stub", tailLen: 18, legLen: 44, legW: 13 }) },
  { name: "돼지", emoji: "🐖", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 92, bodyRy: 54, headR: 30, snout: 22, ear: "point", earLen: 26, tail: "curl", tailLen: 34, legLen: 40, legW: 16 }) },
  { name: "코끼리", emoji: "🐘", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 96, bodyRy: 56, headR: 38, trunk: 86, tusk: true, ear: "round", earW: 34, tail: "thin", tailLen: 48, legLen: 52, legW: 26 }) },
  { name: "기린", emoji: "🦒", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 78, bodyRy: 50, headR: 22, neck: 96, snout: 20, ear: "horn", earLen: 18, tail: "thin", tailLen: 56, legLen: 78, legW: 13 }) },
  { name: "사슴", emoji: "🦌", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 82, bodyRy: 50, headR: 24, neck: 26, snout: 22, ear: "antler", earLen: 52, tail: "stub", tailLen: 20, legLen: 76, legW: 11 }) },
  { name: "낙타", emoji: "🐪", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 92, bodyRy: 50, headR: 24, neck: 32, snout: 22, ear: "point", earLen: 20, hump: 1, tail: "thin", tailLen: 44, legLen: 70, legW: 14 }) },
  { name: "캥거루", emoji: "🦘", cat: "동물", build: (s) => quad({ seed: s, bodyRx: 70, bodyRy: 52, headR: 24, neck: 26, snout: 22, ear: "long", earLen: 52, earW: 11, tail: "thin", tailLen: 110, legLen: 62, legW: 18 }) },
  { name: "박쥐", emoji: "🦇", cat: "동물", build: (s) => bird({ seed: s, bodyRx: 42, bodyRy: 54, bodyRot: 0, headR: 24, beakLen: 0, tailLen: 0, wing: 104, wingRot: -16, legs: 0, crest: 30 }) },

  /* ---- 바다 (13) ---- */
  { name: "물고기", emoji: "🐟", cat: "바다", build: (s) => fish({ seed: s, bodyRx: 88, bodyRy: 52, tail: 74, tailSpread: 58, dorsal: 52, ventral: 34, sideFin: 30 }) },
  { name: "상어", emoji: "🦈", cat: "바다", build: (s) => fish({ seed: s, bodyRx: 104, bodyRy: 48, bodyRot: -4, tail: 70, tailSpread: 62, dorsal: 74, sideFin: 26 }) },
  { name: "고래", emoji: "🐳", cat: "바다", build: (s) => fish({ seed: s, bodyRx: 110, bodyRy: 62, tail: 56, tailSpread: 74, sideFin: 44 }) },
  { name: "돌고래", emoji: "🐬", cat: "바다", build: (s) => fish({ seed: s, bodyRx: 100, bodyRy: 46, bodyRot: -8, tail: 56, tailSpread: 46, dorsal: 56, sideFin: 26 }) },
  { name: "문어", emoji: "🐙", cat: "바다", build: (s) => fish({ seed: s, bodyRx: 72, bodyRy: 74, tentacles: 6, tail: 0 }) },
  { name: "오징어", emoji: "🦑", cat: "바다", build: (s) => fish({ seed: s, bodyRx: 44, bodyRy: 96, tentacles: 5, tail: 0 }) },
  { name: "새우", emoji: "🦐", cat: "바다", build: (s) => fish({ seed: s, bodyRx: 76, bodyRy: 34, tail: 44, tailSpread: 36, whisker: 76 }) },
  { name: "게", emoji: "🦀", cat: "바다", build: (s) => fish({ seed: s, claws: true, bodyRx: 88, bodyRy: 48 }) },
  { name: "해파리", emoji: "🪼", cat: "바다", build: (s) => fish({ seed: s, dome: 78, bodyRx: 96, tail: 0 }) },
  { name: "거북이", emoji: "🐢", cat: "바다", build: (s) => fish({ seed: s, shell: true, bodyRx: 104, bodyRy: 62 }) },
  { name: "가오리", emoji: "🌊", cat: "바다", build: (s) => fish({ seed: s, bodyRx: 118, bodyRy: 34, tail: 110, tailSpread: 12 }) },
  { name: "복어", emoji: "🐡", cat: "바다", build: (s) => fish({ seed: s, bodyRx: 74, bodyRy: 78, tail: 40, tailSpread: 34, dorsal: 44, sideFin: 26 }) },
  { name: "불가사리", emoji: "⭐", cat: "바다", build: (s) => [STAR(dpt(s, 0), 300, 202, 126, 56, 5), C(dpt(s, 1), 300, 202, 28)] },

  /* ---- 곤충 (8) ---- */
  { name: "나비", emoji: "🦋", cat: "곤충", build: (s) => bug({ seed: s, bodyRx: 13, bodyRy: 62, wingUp: 72, wingLow: 50, wingRot: 22, antennae: true }) },
  { name: "벌", emoji: "🐝", cat: "곤충", build: (s) => bug({ seed: s, bodyRx: 26, bodyRy: 56, wingUp: 42, wingRot: 14, legs: 3, antennae: true, slim: 3 }) },
  { name: "잠자리", emoji: "🪰", cat: "곤충", build: (s) => bug({ seed: s, bodyRx: 9, bodyRy: 82, wingUp: 64, wingLow: 64, wingRot: 8, legs: 2, slim: 6 }) },
  { name: "딱정벌레", emoji: "🪲", cat: "곤충", build: (s) => bug({ seed: s, bodyRx: 44, bodyRy: 56, round: true, legs: 3, antennae: true }) },
  { name: "거미", emoji: "🕷️", cat: "곤충", build: (s) => bug({ seed: s, bodyRx: 30, bodyRy: 34, round: true, legs: 4 }) },
  { name: "달팽이", emoji: "🐌", cat: "곤충", build: (s) => bug({ seed: s, bodyRx: 12, bodyRy: 20, spiral: true }) },
  { name: "개미", emoji: "🐜", cat: "곤충", build: (s) => bug({ seed: s, bodyRx: 12, bodyRy: 18, slim: 3, legs: 3, antennae: true }) },
  { name: "귀뚜라미", emoji: "🦗", cat: "곤충", build: (s) => bug({ seed: s, bodyRx: 13, bodyRy: 48, slim: 3, legs: 3, antennae: true }) },

  /* ---- 자연 (11) ---- */
  { name: "큰나무", emoji: "🌳", cat: "자연", build: (s) => plant({ seed: s, kind: "tree" }) },
  { name: "소나무", emoji: "🌲", cat: "자연", build: (s) => plant({ seed: s, kind: "pine" }) },
  { name: "들꽃", emoji: "🌸", cat: "자연", build: (s) => plant({ seed: s, kind: "flower" }) },
  { name: "해바라기", emoji: "🌻", cat: "자연", build: (s) => plant({ seed: s, kind: "sunflower" }) },
  { name: "튤립", emoji: "🌷", cat: "자연", build: (s) => plant({ seed: s, kind: "tulip" }) },
  { name: "버섯", emoji: "🍄", cat: "자연", build: (s) => plant({ seed: s, kind: "mushroom" }) },
  { name: "선인장", emoji: "🌵", cat: "자연", build: (s) => plant({ seed: s, kind: "cactus" }) },
  { name: "야자수", emoji: "🌴", cat: "자연", build: (s) => plant({ seed: s, kind: "palm" }) },
  { name: "단풍잎", emoji: "🍁", cat: "자연", build: (s) => plant({ seed: s, kind: "leaf" }) },
  { name: "대나무", emoji: "🎍", cat: "자연", build: (s) => plant({ seed: s, kind: "bamboo" }) },
  { name: "산과 달", emoji: "🏔️", cat: "자연", build: (s) => plant({ seed: s, kind: "mountain" }) },

  /* ---- 사물 (15) ---- */
  { name: "로켓", emoji: "🚀", cat: "사물", build: O.rocket },
  { name: "커피잔", emoji: "☕", cat: "사물", build: O.mug },
  { name: "우산", emoji: "☂️", cat: "사물", build: O.umbrella },
  { name: "열쇠", emoji: "🔑", cat: "사물", build: O.key },
  { name: "가위", emoji: "✂️", cat: "사물", build: O.scissors },
  { name: "전구", emoji: "💡", cat: "사물", build: O.bulb },
  { name: "시계", emoji: "⏰", cat: "사물", build: O.clock },
  { name: "안경", emoji: "👓", cat: "사물", build: O.glasses },
  { name: "연필", emoji: "✏️", cat: "사물", build: O.pencil },
  { name: "자동차", emoji: "🚗", cat: "사물", build: O.car },
  { name: "돛단배", emoji: "⛵", cat: "사물", build: O.sailboat },
  { name: "집", emoji: "🏠", cat: "사물", build: O.house },
  { name: "등대", emoji: "🗼", cat: "사물", build: O.lighthouse },
  { name: "닻", emoji: "⚓", cat: "사물", build: O.anchor },
  { name: "왕관", emoji: "👑", cat: "사물", build: O.crown },

  /* ---- 기호 (8) ---- */
  { name: "하트", emoji: "❤️", cat: "기호", build: O.heart },
  { name: "별", emoji: "⭐", cat: "기호", build: O.star },
  { name: "초승달", emoji: "🌙", cat: "기호", build: O.moon },
  { name: "태양", emoji: "☀️", cat: "기호", build: O.sun },
  { name: "음표", emoji: "🎵", cat: "기호", build: O.note },
  { name: "풍선", emoji: "🎈", cat: "기호", build: O.balloon },
  { name: "선물상자", emoji: "🎁", cat: "기호", build: O.gift },
  { name: "주사위", emoji: "🎲", cat: "기호", build: O.dice },

  /* ---- 음식 (8) ---- */
  { name: "사과", emoji: "🍎", cat: "음식", build: O.apple },
  { name: "바나나", emoji: "🍌", cat: "음식", build: O.bananaCurve },
  { name: "딸기", emoji: "🍓", cat: "음식", build: O.strawberry },
  { name: "포도", emoji: "🍇", cat: "음식", build: O.grape },
  { name: "수박", emoji: "🍉", cat: "음식", build: O.watermelon },
  { name: "아이스크림", emoji: "🍦", cat: "음식", build: O.icecream },
  { name: "케이크", emoji: "🍰", cat: "음식", build: O.cake },
  { name: "도넛", emoji: "🍩", cat: "음식", build: O.donut },

  /* ---- 캐릭터 (6) ---- */
  { name: "그림자 요원 쉐이드", emoji: "🥷", cat: "캐릭터", build: O.shadeAgent },
  { name: "로봇", emoji: "🤖", cat: "캐릭터", build: (s) => person({ seed: s, hat: "antenna", body: "wide", arms: "side" }) },
  { name: "외계인", emoji: "👽", cat: "캐릭터", build: (s) => person({ seed: s, headR: 44, body: "slim", arms: "up" }) },
  { name: "눈사람", emoji: "⛄", cat: "캐릭터", build: O.snowman },
  { name: "마녀", emoji: "🧙", cat: "캐릭터", build: (s) => person({ seed: s, hat: "pointy", body: "skirt", arms: "side" }) },
  { name: "우주인", emoji: "👨‍🚀", cat: "캐릭터", build: (s) => person({ seed: s, hat: "helmet", body: "wide", arms: "down" }) },
];

/* ------------------------------------------------------------------ */
/* 조언 문구                                                            */
/* ------------------------------------------------------------------ */

const ADVICE: ((n: number) => string)[] = [
  (n) => `조각 ${n}장이 서로 다른 깊이에 있어요. 빛을 좌우로 천천히 옮겨보세요.`,
  () => "앞의 조각은 크게, 뒤의 조각은 아주 조금 밀려나요. 그 차이가 형태를 바꿉니다.",
  () => "먼저 가장 큰 조각의 위치와 크기를 맞추세요. 나머지는 그 뒤에 따라옵니다.",
  () => "빛이 벽에서 멀수록 그림자가 작고 또렷해져요. 깊이 슬라이더를 먼저 손보세요.",
  () => "대칭이 맞는 순간이 눈에 보일 거예요. 방향키로 아주 조금씩 움직여보세요.",
  () => "작은 조각(귀·꼬리·다리)일수록 깊이 차이에 민감해요. 큰 조각부터 붙이세요.",
  () => "그림자는 언제나 빛과 반대 방향으로 흐릅니다. 헷갈리면 orb를 보세요.",
  () => "빛을 위로 올리면 그림자는 아래로 늘어납니다. 높이도 각도의 일부예요.",
  () => "여러 조각이 한 번에 붙지 않으면, 깊이(거리)부터 다시 잡아보세요.",
  () => "완벽은 한 번에 오지 않아요. 80%에서 90%로 가는 길은 정밀 조정입니다.",
  () => "목표 실루엣의 점선 안으로 그림자를 밀어 넣으세요.",
  () => "빛의 경로(광선)를 켜면 조각들이 어느 깊이에 있는지 보여요.",
  () => "같은 깊이의 조각들은 한 몸처럼 움직입니다. 묶음단위로 맞추세요.",
  () => "그림자 예술가는 물체를 자르지 않고, 빛을 자릅니다.",
  () => "막힐 땐 힌트! 빛이 정답 쪽으로 절반쯤 다가갑니다.",
];

/* ------------------------------------------------------------------ */
/* 레벨 확정 (정답 조명 · 시작 위치 · 난이도 자동 생성)                    */
/* ------------------------------------------------------------------ */

export type CatalogSpec = {
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

function finalize(i: number, e: Entry): CatalogSpec {
  const seed = 137 + i * 41;
  const design = e.build(seed);

  // 깊이 분산 보장: 퍼즐이 "이동만"으로 풀리지 않도록 최소한의 레이어 차이를 강제
  const zs0 = design.map((p) => p.z);
  const spread = Math.max(...zs0) - Math.min(...zs0);
  const layers = Math.max(3, Math.min(6, design.length));
  if (spread < 26 || new Set(zs0).size < 3) {
    design.forEach((p, k) => {
      p.z = Math.round(36 + ((k % layers) / (layers - 1)) * 42);
    });
  }
  const minZ = Math.min(...design.map((p) => p.z));
  const solZ = Math.round(clamp(-16 + 32 * Math.sin(i * 0.83), -96, minZ - 26));
  const solX = Math.round(clamp(300 + 92 * Math.sin(i * 1.37), 160, 440));
  const solY = Math.round(clamp(202 + 58 * Math.cos(i * 0.96), 140, 270));
  const ang = i * 2.39996;
  const dist = 152 + 44 * Math.sin(i * 1.71);
  const start: Light = {
    x: clamp(solX + Math.cos(ang) * dist, 74, 526),
    y: clamp(solY + Math.sin(ang) * dist * 0.7, 46, 354),
    z: clamp(solZ - 26 - 16 * Math.sin(i * 0.61), -108, minZ - 28),
  };
  return {
    id: `${i + 1}-${e.name}`,
    index: i,
    name: e.name,
    emoji: e.emoji,
    category: e.cat,
    advice: ADVICE[i % ADVICE.length](design.length),
    solution: { x: solX, y: solY, z: solZ },
    start,
    tolerance: 0.875 + Math.min(0.024, design.length * 0.0022),
    design,
  };
}

export const CATALOG: CatalogSpec[] = ENTRIES.map((e, i) => finalize(i, e));
export const TOTAL = CATALOG.length;
