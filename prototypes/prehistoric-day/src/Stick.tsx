import React from "react";
import type { Mouth } from "./motion";

/** The channel's hand-drawn stick figures, drawn in code so every pose is exact and the monkey
 *  can never drift between scenes. One component, one fixed description (in/characters.md).
 *
 *  Angles are in degrees. 0 = hanging straight down, positive = towards the way the figure
 *  faces. Each limb is [upper, lower]; the lower angle is relative to the upper one.
 *  The figure is drawn facing right and mirrored for face = -1. */

export const INK = "#1d1a17";
export const PAPER = "#f4ecd8"; // cream
export const WHITE = "#fffdf6";
export const TAN = "#d8b783";
export const BROWN = "#8a5a2e";
export const BLUE = "#3f6fb5";
export const RED = "#c9443a";

export type Pose = {
  la: [number, number]; // far arm
  ra: [number, number]; // near arm
  ll: [number, number]; // far leg
  rl: [number, number]; // near leg
  lean: number; // torso, + = forward
  tilt: number; // head
};

export const STAND: Pose = { la: [-12, 8], ra: [12, 10], ll: [-6, 0], rl: [6, 0], lean: 0, tilt: 0 };
export const SIT: Pose = { la: [25, 50], ra: [35, 45], ll: [82, -95], rl: [78, -88], lean: 4, tilt: 0 };
export const KNEEL: Pose = { la: [40, 30], ra: [40, 30], ll: [75, -155], rl: [80, -160], lean: 14, tilt: 6 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const l2 = (a: [number, number], b: [number, number], t: number): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  la: l2(a.la, b.la, t), ra: l2(a.ra, b.ra, t), ll: l2(a.ll, b.ll, t), rl: l2(a.rl, b.rl, t),
  lean: lerp(a.lean, b.lean, t), tilt: lerp(a.tilt, b.tilt, t),
});
/** Override only some limbs of a pose. */
export const withPose = (p: Pose, o: Partial<Pose>): Pose => ({ ...p, ...o });

/** A walk cycle. ph advances about 0.25 per frame for a relaxed stroll. */
export function walk(ph: number): Pose {
  const s = Math.sin(ph);
  const knee = (p: number) => -Math.max(0, -Math.cos(p)) * 40 - 4;
  return {
    ll: [26 * s, knee(ph)],
    rl: [-26 * s, knee(ph + Math.PI)],
    la: [-24 * s, 18],
    ra: [24 * s, 18],
    lean: 4,
    tilt: 2 * Math.sin(ph * 2),
  };
}

const rad = (d: number) => (d * Math.PI) / 180;
type P = [number, number];
const step = (p: P, ang: number, len: number): P => [p[0] + Math.sin(rad(ang)) * len, p[1] + Math.cos(rad(ang)) * len];
const limb = (o: P, [u, l]: [number, number], a: number, b: number) => {
  const m = step(o, u, a);
  const e = step(m, u + l, b);
  return { m, e, d: `M ${o[0]} ${o[1]} L ${m[0]} ${m[1]} L ${e[0]} ${e[1]}` };
};

export type Hands = { near: P; far: P; nearAng: number; farAng: number };

type Props = {
  x: number;
  ground: number; // the feet line
  pose: Pose;
  face?: 1 | -1;
  scale?: number;
  seat?: number; // a fixed hip height above the ground (sitting); default: feet touch the ground
  mouth?: Mouth;
  blink?: boolean;
  hair?: "tuft" | "bun" | "long" | "none";
  tunic?: boolean;
  monkey?: boolean;
  tailSway?: number; // degrees
  /** props held in the hands, drawn in the torso's frame (they lean with the body) */
  hold?: (h: Hands) => React.ReactNode;
  holdBehind?: (h: Hands) => React.ReactNode;
};

const LEG: [number, number] = [70, 68];
const ARM: [number, number] = [58, 56];
const TORSO = 138;
const R = 37;
const W = 7;

export const Stick: React.FC<Props> = ({
  x, ground, pose, face = 1, scale = 1, seat, mouth = "closed", blink = false,
  hair = "none", tunic = false, monkey = false, tailSway = 0, hold, holdBehind,
}) => {
  const hip: P = [0, 0];
  const far = limb(hip, pose.ll, LEG[0], LEG[1]);
  const near = limb(hip, pose.rl, LEG[0], LEG[1]);
  // the lower foot touches the ground, unless the figure sits
  const reach = seat ?? Math.max(far.e[1], near.e[1], 20);

  const sh: P = [0, -TORSO + 16];
  const aFar = limb(sh, pose.la, ARM[0], ARM[1]);
  const aNear = limb(sh, pose.ra, ARM[0], ARM[1]);
  const hands: Hands = { far: aFar.e, near: aNear.e, farAng: pose.la[0] + pose.la[1], nearAng: pose.ra[0] + pose.ra[1] };
  const line = { stroke: INK, strokeWidth: W, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const thin = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

  // face: features sit a little towards the way the figure looks
  const fx = 7;
  const eyes = blink ? (
    <>
      <path d={`M ${fx - 15} -6 L ${fx - 7} -6 M ${fx + 7} -6 L ${fx + 15} -6`} {...line} strokeWidth={4} />
    </>
  ) : (
    <>
      <circle cx={fx - 11} cy={-7} r={4.6} fill={INK} />
      <circle cx={fx + 11} cy={-7} r={4.6} fill={INK} />
    </>
  );
  const my = monkey ? 17 : 12;
  const mouthEl =
    mouth === "closed" ? (
      <path d={`M ${fx - 9} ${my} Q ${fx} ${my + 7} ${fx + 9} ${my}`} {...line} strokeWidth={4} />
    ) : (
      <ellipse cx={fx} cy={my + 2} rx={mouth === "wide" ? 8 : 6} ry={mouth === "wide" ? 8 : 4.5} fill={INK} />
    );

  return (
    <g transform={`translate(${x} ${ground}) scale(${face * scale} ${scale}) translate(0 ${-reach})`}>
      {/* contact shadow: flat, no gradient */}
      <ellipse cx={0} cy={reach + 2} rx={seat ? 70 : 46} ry={8} fill={INK} opacity={0.12} />

      {monkey && (
        <path
          transform={`rotate(${tailSway} -4 -6)`}
          d="M -4 -6 C -55 8, -96 -18, -88 -70 C -82 -108, -40 -112, -42 -84 C -43 -68, -60 -70, -58 -82"
          {...line} strokeWidth={6}
        />
      )}
      <path d={far.d} {...line} />
      <path d={near.d} {...line} />

      <g transform={`rotate(${pose.lean})`}>
        {holdBehind?.(hands)}
        <path d={aFar.d} {...line} />
        {tunic && (
          <path
            d={`M -16 ${-TORSO + 14} L 16 ${-TORSO + 14} L 30 14 L 20 26 L 10 14 L 0 26 L -10 14 L -20 26 L -30 14 Z`}
            fill={TAN} {...thin}
          />
        )}
        <path d={`M 0 0 L 0 ${-TORSO}`} {...line} />
        {monkey && (
          <>
            {/* small blue shirt */}
            <path d={`M -19 ${-TORSO + 10} L 19 ${-TORSO + 10} L 24 ${-TORSO + 78} L -24 ${-TORSO + 78} Z`} fill={BLUE} {...thin} />
            <path d={`M -10 ${-TORSO + 10} L 0 ${-TORSO + 22} L 10 ${-TORSO + 10}`} fill={WHITE} {...thin} strokeWidth={3} />
            {/* red tie */}
            <path d={`M -5 ${-TORSO + 20} L 5 ${-TORSO + 20} L 3 ${-TORSO + 27} L -3 ${-TORSO + 27} Z`} fill={RED} {...thin} strokeWidth={3} />
            <path d={`M -3 ${-TORSO + 27} L 3 ${-TORSO + 27} L 7 ${-TORSO + 62} L 0 ${-TORSO + 71} L -7 ${-TORSO + 62} Z`} fill={RED} {...thin} strokeWidth={3} />
          </>
        )}
        <path d={aNear.d} {...line} />
        {hold?.(hands)}

        <g transform={`translate(0 ${-TORSO - R + 2}) rotate(${pose.tilt} 0 ${R})`}>
          {monkey && (
            <>
              <circle cx={-R - 4} cy={-4} r={15} fill={PAPER} {...thin} />
              <circle cx={-R - 4} cy={-4} r={7} fill={TAN} />
              <circle cx={R + 4} cy={-4} r={15} fill={PAPER} {...thin} />
              <circle cx={R + 4} cy={-4} r={7} fill={TAN} />
            </>
          )}
          {hair === "long" && <path d={`M -30 -22 C -46 10, -42 40, -26 52 L -10 30`} fill={BROWN} {...thin} />}
          {hair === "bun" && <circle cx={-26} cy={-30} r={14} fill={BROWN} {...thin} />}
          <circle cx={0} cy={0} r={R} fill={PAPER} {...thin} strokeWidth={6} />
          {hair === "tuft" && <path d="M -14 -34 Q -10 -52 -2 -38 Q 2 -56 10 -36 Q 18 -50 20 -32" fill="none" stroke={BROWN} strokeWidth={6} strokeLinecap="round" />}
          {(hair === "long" || hair === "bun") && <path d={`M -34 -14 Q -20 -44 14 -36 Q 30 -30 34 -14 Q 10 -28 -34 -14 Z`} fill={BROWN} {...thin} strokeWidth={3} />}
          {monkey && (
            <>
              <path d={`M -14 -26 Q 0 -40 14 -26`} fill="none" stroke={BROWN} strokeWidth={5} strokeLinecap="round" />
              <ellipse cx={fx + 2} cy={12} rx={23} ry={17} fill={TAN} {...thin} strokeWidth={3.5} />
              <circle cx={fx - 3} cy={6} r={2.4} fill={INK} />
              <circle cx={fx + 7} cy={6} r={2.4} fill={INK} />
            </>
          )}
          {eyes}
          {mouthEl}
        </g>
      </g>
    </g>
  );
};

/** The monkey guide: always the same figure. Only the pose, place and mouth change. */
export const Monkey: React.FC<Omit<Props, "monkey" | "hair" | "tunic">> = (p) => <Stick {...p} monkey />;
