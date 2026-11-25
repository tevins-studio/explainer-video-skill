import React from "react";
import { HAIR, HIDE, MONKEY, SKIN, ACCENT } from "../toon/palette";
import { INK } from "./Stickman";
import type { StickDesign } from "./Stickman";

/** The stick cast. Colour is kept for clothing and the details that identify a character. */
const ol = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const };

/** The monkey presenter as a stickman: brown round head, cream face and muzzle, ears, tuft,
 *  blue shirt, red tie, dark trousers, thin stick arms and legs, a long curling tail. */
export const MONKEY_STICK: StickDesign = {
  id: "monkey",
  monkey: true,
  R: 46,
  size: 1,
  head: MONKEY.fur,
  face: MONKEY.face,
  top: { color: MONKEY.shirt, len: 6 },
  sleeve: 0.42,
  tie: MONKEY.tie,
  legs: { color: MONKEY.trousers, to: 0.92 },
};

/** Ama, the gatherer: auburn hair with a braid, ochre hide dress, bead necklace. */
export const AMA_STICK: StickDesign = {
  id: "ama",
  R: 42,
  size: 1,
  head: SKIN.medium[0],
  top: { color: HIDE.ochre, len: 62, flare: 10, fringe: true },
  necklace: [ACCENT.teal, ACCENT.bead, ACCENT.teal, ACCENT.bead, ACCENT.teal],
  feet: HIDE.leather,
  hairBack: (R) => (
    <g>
      {[0, 1, 2].map((i) => <ellipse key={i} cx={-R * 0.92} cy={R * (0.55 + i * 0.36)} rx={R * 0.17} ry={R * 0.2} fill={HAIR.auburn} {...ol} />)}
    </g>
  ),
  hair: (R) => (
    <path d={`M ${-R * 1.0} ${R * 0.1} Q ${-R * 1.06} ${-R * 1.08} ${R * 0.05} ${-R * 1.04} Q ${R * 1.02} ${-R * 0.98} ${R * 1.0} ${-R * 0.05} Q ${R * 0.6} ${-R * 0.66} ${-R * 0.05} ${-R * 0.6} Q ${-R * 0.62} ${-R * 0.56} ${-R * 1.0} ${R * 0.1} Z`}
      fill={HAIR.auburn} {...ol} />
  ),
};

/** Tuk, the child: spiky dark hair, short brown tunic. */
export const TUK_STICK: StickDesign = {
  id: "tuk",
  R: 38,
  size: 0.68,
  head: SKIN.tan[0],
  top: { color: HIDE.brown, len: 26, flare: 4, fringe: true },
  hair: (R) => (
    <path d={`M ${-R * 0.98} ${-R * 0.2} L ${-R * 1.06} ${-R * 0.66} L ${-R * 0.66} ${-R * 0.78} L ${-R * 0.56} ${-R * 1.18} L ${-R * 0.16} ${-R * 0.96} L ${R * 0.06} ${-R * 1.3} L ${R * 0.3} ${-R * 0.98} L ${R * 0.72} ${-R * 1.12} L ${R * 0.74} ${-R * 0.72} L ${R * 1.06} ${-R * 0.56} L ${R * 0.98} ${-R * 0.2} Q ${R * 0.4} ${-R * 0.62} ${-R * 0.1} ${-R * 0.5} Q ${-R * 0.6} ${-R * 0.6} ${-R * 0.98} ${-R * 0.2} Z`}
      fill={HAIR.dark} {...ol} />
  ),
};

/** Oru, the toolmaker: curly black hair, short beard, red headband, brown fur vest. */
export const ORU_STICK: StickDesign = {
  id: "oru",
  R: 43,
  size: 1.06,
  head: SKIN.deep[0],
  top: { color: HIDE.brown, len: 14, collar: HIDE.fur },
  legs: { color: HIDE.ochre, to: 0.55 },
  belt: HIDE.leather,
  hair: (R) => (
    <g>
      {[-0.72, -0.36, 0, 0.36, 0.72].map((k, i) => <circle key={i} cx={R * k} cy={-R * (0.78 + (i % 2) * 0.14)} r={R * 0.28} fill={HAIR.dark} {...ol} />)}
      {[-0.72, -0.36, 0, 0.36, 0.72].map((k, i) => <circle key={`f${i}`} cx={R * k} cy={-R * (0.78 + (i % 2) * 0.14)} r={R * 0.28 - 3} fill={HAIR.dark} />)}
      <path d={`M ${-R * 0.97} ${-R * 0.36} Q 0 ${-R * 0.56} ${R * 0.97} ${-R * 0.36}`} stroke={ACCENT.red} strokeWidth={8} fill="none" />
    </g>
  ),
  beard: (R) => (
    <path d={`M ${-R * 0.62} ${R * 0.25} Q ${-R * 0.6} ${R * 0.98} 0 ${R * 1.0} Q ${R * 0.6} ${R * 0.98} ${R * 0.62} ${R * 0.25} Q ${R * 0.3} ${R * 0.62} 0 ${R * 0.58} Q ${-R * 0.3} ${R * 0.62} ${-R * 0.62} ${R * 0.25} Z`}
      fill={HAIR.dark} {...ol} />
  ),
};

/** Nana, the elder: grey top-knot, long green-grey cloak with long sleeves. */
export const NANA_STICK: StickDesign = {
  id: "nana",
  R: 42,
  size: 0.98,
  head: SKIN.light[0],
  top: { color: HIDE.cloak, len: 118, flare: 16, collar: HIDE.fur },
  sleeve: 1,
  hairBack: (R) => <circle cx={0} cy={-R * 1.0} r={R * 0.32} fill={HAIR.grey} {...ol} />,
  hair: (R) => (
    <path d={`M ${-R * 0.98} ${R * 0.05} Q ${-R * 1.0} ${-R * 1.0} 0 ${-R * 1.0} Q ${R * 1.0} ${-R * 1.0} ${R * 0.98} ${R * 0.05} Q ${R * 0.7} ${-R * 0.56} 0 ${-R * 0.62} Q ${-R * 0.7} ${-R * 0.56} ${-R * 0.98} ${R * 0.05} Z`}
      fill={HAIR.grey} {...ol} />
  ),
};

export const STICK_CAST = [MONKEY_STICK, AMA_STICK, TUK_STICK, ORU_STICK, NANA_STICK];
