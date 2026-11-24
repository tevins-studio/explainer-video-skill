import React from "react";
import { HAIR, HIDE, INK, MONKEY, SKIN, ACCENT } from "./palette";

/** The cast. Each character is defined once, here; every scene draws it from this record.
 *  Written descriptions of the same designs are in in/characters.md. */
export type Design = {
  id: string;
  kind: "monkey" | "human";
  R: number; // head radius
  body: number; // body scale under the head
  skin: string;
  skinShade: string;
  hand: string;
  feet: string;
  hair?: string;
  top: { style: "shirt" | "dress" | "vest" | "tunic" | "cloak"; color: string; shade: string; trim?: string; skirt?: number; fringe?: boolean };
  sleeve: number; // 0 none, 0.25 short, 1 long
  legs: { color: string; shade: string; cover: number; wrap?: string };
  necklace?: boolean;
  belt?: boolean;
  pouch?: boolean;
  wrinkles?: boolean;
  backHair?: (R: number) => React.ReactNode;
  frontHair?: (R: number, t: number) => React.ReactNode;
  beard?: (R: number, t: number) => React.ReactNode;
};

const st = { stroke: INK, strokeWidth: 4.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Our recurring presenter. Brown monkey, cream face and muzzle, round ears, a small tuft,
 *  blue shirt, red tie, dark trousers, a long curling tail. Friendly and cheeky. */
export const MONKEY_GUIDE: Design = {
  id: "monkey",
  kind: "monkey",
  R: 74,
  body: 1,
  skin: MONKEY.fur,
  skinShade: MONKEY.furShade,
  hand: MONKEY.face,
  feet: MONKEY.face,
  top: { style: "shirt", color: MONKEY.shirt, shade: MONKEY.shirtShade },
  sleeve: 0.25,
  legs: { color: MONKEY.trousers, shade: MONKEY.trousersShade, cover: 1 },
};

/** Ama, the gatherer: braided auburn hair, ochre hide dress with a fur collar, bead necklace. */
export const GATHERER: Design = {
  id: "gatherer",
  kind: "human",
  R: 66,
  body: 1.02,
  skin: SKIN.medium[0],
  skinShade: SKIN.medium[1],
  hand: SKIN.medium[0],
  feet: HIDE.leather,
  hair: HAIR.auburn,
  top: { style: "dress", color: HIDE.ochre, shade: HIDE.ochreShade, trim: HIDE.fur, skirt: 52, fringe: true },
  sleeve: 0,
  legs: { color: HIDE.ochre, shade: HIDE.ochreShade, cover: 0, wrap: HIDE.leather },
  necklace: true,
  backHair: (R) => (
    <g>
      <path d={`M ${-R * 1.02} ${R * 0.1} Q ${-R * 1.15} ${-R * 1.1} 0 ${-R * 1.1} Q ${R * 1.15} ${-R * 1.1} ${R * 1.02} ${R * 0.1} Q ${R * 0.6} ${R * 0.5} 0 ${R * 0.4} Q ${-R * 0.6} ${R * 0.5} ${-R * 1.02} ${R * 0.1} Z`}
        fill={HAIR.auburn} {...st} />
      {/* the braid over the back shoulder */}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={-R * 0.95 - i * 3} cy={R * (0.5 + i * 0.36)} rx={R * 0.2} ry={R * 0.22} fill={HAIR.auburn} {...st} />
      ))}
      <path d={`M ${-R * 1.06} ${R * 1.75} l -8 18 M ${-R * 1.06} ${R * 1.75} l 6 18`} stroke={HAIR.auburn} strokeWidth={6} strokeLinecap="round" />
    </g>
  ),
  frontHair: (R, t) => (
    <path d={`M ${-R * 0.98} ${-R * 0.05} Q ${-R * 0.95} ${-R * 1.05} ${t * 0.3} ${-R * 1.02} Q ${R * 0.95} ${-R * 1.0} ${R * 0.98} ${-R * 0.1} Q ${R * 0.7} ${-R * 0.62} ${t * 0.5 + R * 0.05} ${-R * 0.58} Q ${-R * 0.5} ${-R * 0.75} ${-R * 0.98} ${-R * 0.05} Z`}
      fill={HAIR.auburn} {...st} />
  ),
};

/** Tuk, the child: messy dark hair, short hide tunic with a rope belt, bare feet. */
export const CHILD: Design = {
  id: "child",
  kind: "human",
  R: 60,
  body: 0.66,
  skin: SKIN.tan[0],
  skinShade: SKIN.tan[1],
  hand: SKIN.tan[0],
  feet: SKIN.tan[0],
  hair: HAIR.dark,
  top: { style: "tunic", color: HIDE.brown, shade: HIDE.brownShade, skirt: 34, fringe: true },
  sleeve: 0,
  legs: { color: HIDE.brown, shade: HIDE.brownShade, cover: 0 },
  frontHair: (R, t) => (
    <path d={`M ${-R * 0.96} ${-R * 0.1} L ${-R * 1.1} ${-R * 0.62} L ${-R * 0.7} ${-R * 0.82} L ${-R * 0.62} ${-R * 1.22} L ${-R * 0.2} ${-R * 1.0} L ${t * 0.3} ${-R * 1.36} L ${R * 0.28} ${-R * 1.02} L ${R * 0.72} ${-R * 1.18} L ${R * 0.76} ${-R * 0.78} L ${R * 1.1} ${-R * 0.6} L ${R * 0.96} ${-R * 0.1} Q ${R * 0.6} ${-R * 0.56} ${t * 0.4} ${-R * 0.48} L ${-R * 0.12} ${-R * 0.66} L ${-R * 0.3} ${-R * 0.46} Q ${-R * 0.7} ${-R * 0.54} ${-R * 0.96} ${-R * 0.1} Z`}
      fill={HAIR.dark} {...st} />
  ),
};

/** Oru, the toolmaker: curly dark hair, short beard, red-ochre headband, fur vest, belt and pouch. */
export const TOOLMAKER: Design = {
  id: "toolmaker",
  kind: "human",
  R: 66,
  body: 1.1,
  skin: SKIN.deep[0],
  skinShade: SKIN.deep[1],
  hand: SKIN.deep[0],
  feet: HIDE.leather,
  hair: HAIR.dark,
  top: { style: "vest", color: HIDE.brown, shade: HIDE.brownShade },
  sleeve: 0,
  legs: { color: HIDE.ochre, shade: HIDE.ochreShade, cover: 0.85, wrap: HIDE.leather },
  belt: true,
  pouch: true,
  frontHair: (R, t) => (
    <g>
      {[-0.8, -0.45, -0.1, 0.25, 0.6, 0.88].map((k, i) => (
        <circle key={i} cx={R * k + t * 0.3} cy={-R * (0.72 + (i % 2) * 0.16)} r={R * 0.3} fill={HAIR.dark} {...st} />
      ))}
      {[-0.8, -0.45, -0.1, 0.25, 0.6, 0.88].map((k, i) => (
        <circle key={`f${i}`} cx={R * k + t * 0.3} cy={-R * (0.72 + (i % 2) * 0.16)} r={R * 0.3 - 4} fill={HAIR.dark} />
      ))}
      <path d={`M ${-R * 0.98} ${-R * 0.42} Q ${t * 0.3} ${-R * 0.64} ${R * 0.98} ${-R * 0.42}`} stroke={ACCENT.red} strokeWidth={13} fill="none" />
      <path d={`M ${-R * 0.98} ${-R * 0.42} Q ${t * 0.3} ${-R * 0.64} ${R * 0.98} ${-R * 0.42}`} stroke={INK} strokeWidth={2.5} fill="none" strokeDasharray="1 9" strokeLinecap="round" />
    </g>
  ),
  beard: (R, t) => (
    <path d={`M ${t - R * 0.72} ${R * 0.25} Q ${t - R * 0.7} ${R * 1.05} ${t} ${R * 1.08} Q ${t + R * 0.7} ${R * 1.05} ${t + R * 0.72} ${R * 0.25} Q ${t + R * 0.5} ${R * 0.5} ${t + R * 0.28} ${R * 0.36} Q ${t} ${R * 0.28} ${t - R * 0.28} ${R * 0.36} Q ${t - R * 0.5} ${R * 0.5} ${t - R * 0.72} ${R * 0.25} Z M ${t - R * 0.3} ${R * 0.62} Q ${t} ${R * 0.8} ${t + R * 0.3} ${R * 0.62} Q ${t} ${R * 0.52} ${t - R * 0.3} ${R * 0.62} Z`}
      fill={HAIR.dark} fillRule="evenodd" {...st} />
  ),
};

/** Nana, the elder: grey hair in a top-knot, a long green-grey cloak with a fur collar. */
export const ELDER: Design = {
  id: "elder",
  kind: "human",
  R: 64,
  body: 0.98,
  skin: SKIN.light[0],
  skinShade: SKIN.light[1],
  hand: SKIN.light[0],
  feet: HIDE.leather,
  hair: HAIR.grey,
  top: { style: "cloak", color: HIDE.cloak, shade: HIDE.cloakShade, trim: HIDE.fur, skirt: 96 },
  sleeve: 1,
  legs: { color: HIDE.cloak, shade: HIDE.cloakShade, cover: 0.6, wrap: HIDE.leather },
  necklace: false,
  wrinkles: true,
  backHair: (R) => <circle cx={0} cy={-R * 1.02} r={R * 0.36} fill={HAIR.grey} {...st} />,
  frontHair: (R, t) => (
    <path d={`M ${-R * 0.98} ${R * 0.1} Q ${-R * 1.02} ${-R * 1.02} ${t * 0.3} ${-R * 1.0} Q ${R * 1.02} ${-R * 1.0} ${R * 0.98} ${R * 0.1} Q ${R * 0.82} ${-R * 0.5} ${t * 0.3} ${-R * 0.62} Q ${-R * 0.82} ${-R * 0.5} ${-R * 0.98} ${R * 0.1} Z`}
      fill={HAIR.grey} {...st} />
  ),
};

/** A second adult for the group scenes: chestnut hair in a short bob, teal-dyed hide tunic. */
export const HUNTER: Design = {
  id: "hunter",
  kind: "human",
  R: 64,
  body: 1.06,
  skin: SKIN.light[0],
  skinShade: SKIN.light[1],
  hand: SKIN.light[0],
  feet: HIDE.leather,
  hair: HAIR.chestnut,
  top: { style: "tunic", color: "#4f8e88", shade: "#3d736e", trim: HIDE.fur, skirt: 44, fringe: true },
  sleeve: 0.25,
  legs: { color: HIDE.brown, shade: HIDE.brownShade, cover: 0.9, wrap: HIDE.leather },
  belt: true,
  frontHair: (R, t) => (
    <path d={`M ${-R * 1.02} ${R * 0.2} Q ${-R * 1.1} ${-R * 1.08} ${t * 0.3} ${-R * 1.04} Q ${R * 1.1} ${-R * 1.04} ${R * 1.02} ${R * 0.2} L ${R * 0.84} ${R * 0.22} Q ${R * 0.84} ${-R * 0.5} ${t * 0.3 + R * 0.2} ${-R * 0.6} Q ${-R * 0.2} ${-R * 0.42} ${-R * 0.5} ${-R * 0.62} Q ${-R * 0.84} ${-R * 0.5} ${-R * 0.84} ${R * 0.22} Z`}
      fill={HAIR.chestnut} {...st} />
  ),
  beard: (R, t) => <path d={`M ${t - R * 0.34} ${R * 0.36} Q ${t} ${R * 0.22} ${t + R * 0.34} ${R * 0.36}`} stroke={HAIR.chestnut} strokeWidth={9} fill="none" strokeLinecap="round" />,
};

export const CAST = [MONKEY_GUIDE, GATHERER, CHILD, TOOLMAKER, ELDER, HUNTER];
