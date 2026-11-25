import React from "react";
import { INK } from "./Stickman";
import type { StickDesign } from "./Stickman";

/** The stick cast, strictly black and white (2026-11-25): black outlines, limbs and features,
 *  white faces and bodies, no colour on any character. Colour lives only in the backgrounds and
 *  in the story props a character picks up (a berry, a flint). Each character stays recognisable
 *  by its shapes: hair, garment cut, tie, tail. */
const W = "#ffffff";
const ol = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const };

/** The monkey presenter: round monkey head with ears, a muzzle mask and a small tuft; shirt and
 *  tie shapes in white with black outlines; black trousers; a long curling tail. */
export const MONKEY_STICK: StickDesign = {
  id: "monkey",
  monkey: true,
  R: 46,
  size: 1,
  head: W,
  face: W,
  top: { color: W, len: 6 },
  sleeve: 0.42,
  tie: W,
  legs: { color: INK, to: 0.92 },
};

/** Ama, the gatherer: black hair with a braid, a fringed hide dress, a bead necklace. */
export const AMA_STICK: StickDesign = {
  id: "ama",
  R: 42,
  size: 1,
  head: W,
  top: { color: W, len: 62, flare: 10, fringe: true },
  necklace: [W, INK, W, INK, W],
  hairBack: (R) => (
    <g>
      {[0, 1, 2].map((i) => <ellipse key={i} cx={-R * 0.92} cy={R * (0.55 + i * 0.36)} rx={R * 0.17} ry={R * 0.2} fill={INK} {...ol} />)}
    </g>
  ),
  hair: (R) => (
    <path d={`M ${-R * 1.0} ${R * 0.1} Q ${-R * 1.06} ${-R * 1.08} ${R * 0.05} ${-R * 1.04} Q ${R * 1.02} ${-R * 0.98} ${R * 1.0} ${-R * 0.05} Q ${R * 0.6} ${-R * 0.66} ${-R * 0.05} ${-R * 0.6} Q ${-R * 0.62} ${-R * 0.56} ${-R * 1.0} ${R * 0.1} Z`}
      fill={INK} {...ol} />
  ),
};

/** Tuk, the child: spiky black hair, a short fringed tunic. */
export const TUK_STICK: StickDesign = {
  id: "tuk",
  R: 38,
  size: 0.68,
  head: W,
  top: { color: W, len: 26, flare: 4, fringe: true },
  hair: (R) => (
    <path d={`M ${-R * 0.98} ${-R * 0.2} L ${-R * 1.06} ${-R * 0.66} L ${-R * 0.66} ${-R * 0.78} L ${-R * 0.56} ${-R * 1.18} L ${-R * 0.16} ${-R * 0.96} L ${R * 0.06} ${-R * 1.3} L ${R * 0.3} ${-R * 0.98} L ${R * 0.72} ${-R * 1.12} L ${R * 0.74} ${-R * 0.72} L ${R * 1.06} ${-R * 0.56} L ${R * 0.98} ${-R * 0.2} Q ${R * 0.4} ${-R * 0.62} ${-R * 0.1} ${-R * 0.5} Q ${-R * 0.6} ${-R * 0.6} ${-R * 0.98} ${-R * 0.2} Z`}
      fill={INK} {...ol} />
  ),
};

/** Oru, the toolmaker: curly black hair, a black beard, a headband, a vest and a belt. */
export const ORU_STICK: StickDesign = {
  id: "oru",
  R: 43,
  size: 1.06,
  head: W,
  top: { color: W, len: 14 },
  legs: { color: W, to: 0.55 },
  belt: INK,
  hair: (R) => (
    <g>
      {[-0.72, -0.36, 0, 0.36, 0.72].map((k, i) => <circle key={i} cx={R * k} cy={-R * (0.78 + (i % 2) * 0.14)} r={R * 0.28} fill={INK} {...ol} />)}
      <path d={`M ${-R * 0.97} ${-R * 0.36} Q 0 ${-R * 0.56} ${R * 0.97} ${-R * 0.36}`} stroke={INK} strokeWidth={12} fill="none" />
      <path d={`M ${-R * 0.95} ${-R * 0.36} Q 0 ${-R * 0.56} ${R * 0.95} ${-R * 0.36}`} stroke={W} strokeWidth={6} fill="none" />
    </g>
  ),
  beard: (R) => (
    <path d={`M ${-R * 0.62} ${R * 0.25} Q ${-R * 0.6} ${R * 0.98} 0 ${R * 1.0} Q ${R * 0.6} ${R * 0.98} ${R * 0.62} ${R * 0.25} Q ${R * 0.3} ${R * 0.62} 0 ${R * 0.58} Q ${-R * 0.3} ${R * 0.62} ${-R * 0.62} ${R * 0.25} Z`}
      fill={INK} {...ol} />
  ),
};

/** Nana, the elder: white hair in a top-knot (outlined), a long cloak with long sleeves. */
export const NANA_STICK: StickDesign = {
  id: "nana",
  R: 42,
  size: 0.98,
  head: W,
  top: { color: W, len: 118, flare: 16 },
  sleeve: 1,
  hairBack: (R) => <circle cx={0} cy={-R * 1.0} r={R * 0.32} fill={W} {...ol} />,
  hair: (R) => (
    <path d={`M ${-R * 0.98} ${R * 0.05} Q ${-R * 1.0} ${-R * 1.0} 0 ${-R * 1.0} Q ${R * 1.0} ${-R * 1.0} ${R * 0.98} ${R * 0.05} Q ${R * 0.7} ${-R * 0.56} 0 ${-R * 0.62} Q ${-R * 0.7} ${-R * 0.56} ${-R * 0.98} ${R * 0.05} Z`}
      fill={W} {...ol} />
  ),
};

export const STICK_CAST = [MONKEY_STICK, AMA_STICK, TUK_STICK, ORU_STICK, NANA_STICK];
