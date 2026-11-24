import React from "react";
import { HIDE, INK, MONKEY, MOUTH, WHITE, ACCENT } from "./palette";
import type { Design } from "./cast";
import type { Pose } from "./poses";

/** One rig for every character. A character is a Design (cast.ts) + a Pose (poses.ts) + an
 *  expression. Nothing about a character is drawn anywhere else, so it looks identical in every
 *  scene. Local space: facing right, y down, origin = the point on the ground between the feet.
 *  Limb angles: 0 = hanging down, + = towards the facing side. Lower angles are relative. */

export type Expr =
  | "neutral" | "happy" | "excited" | "surprised" | "worried" | "sour" | "pain"
  | "cheeky" | "sleepy" | "laugh" | "scared" | "proud" | "focused";
export type Talk = "closed" | "open" | "wide";
export type HandShape = "open" | "fist" | "point" | "hold" | "wave";

type P = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const step = (p: P, ang: number, len: number): P => [p[0] + Math.sin(rad(ang)) * len, p[1] + Math.cos(rad(ang)) * len];
const OUT = 4.5; // the outline width, the same on every character

/** A tube with a clean outline: ink underneath, colour on top. */
const Tube: React.FC<{ d: string; w: number; fill: string; o?: number }> = ({ d, w, fill, o = OUT }) => (
  <>
    <path d={d} stroke={INK} strokeWidth={w + 2 * o} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={fill} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>
);
/** Several shapes outlined as one silhouette (the union trick: all ink first, then all fills). */
type Shape = { el: "circle" | "ellipse" | "path"; p: Record<string, number | string> };
const Union: React.FC<{ shapes: Shape[]; fill: string; o?: number }> = ({ shapes, fill, o = OUT }) => (
  <>
    {shapes.map((s, i) => React.createElement(s.el, { key: `o${i}`, ...s.p, fill: INK, stroke: INK, strokeWidth: 2 * o, strokeLinejoin: "round" }))}
    {shapes.map((s, i) => React.createElement(s.el, { key: `f${i}`, ...s.p, fill }))}
  </>
);

// ------------------------------------------------------------------ hands

export const Hand: React.FC<{ at: P; ang: number; shape: HandShape; color: string; s?: number }> = ({ at, ang, shape, color, s = 1 }) => {
  const st = { stroke: INK, strokeWidth: OUT, strokeLinejoin: "round" as const };
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${-ang}) scale(${s})`}>
      {shape === "point" && <rect x={-5} y={10} width={10} height={30} rx={5} fill={color} {...st} />}
      {(shape === "open" || shape === "wave") && (
        <>
          <ellipse cx={-9} cy={24} rx={5} ry={10} fill={color} {...st} transform="rotate(18 -9 24)" />
          <ellipse cx={0} cy={27} rx={5} ry={11} fill={color} {...st} />
          <ellipse cx={9} cy={24} rx={5} ry={10} fill={color} {...st} transform="rotate(-18 9 24)" />
        </>
      )}
      <ellipse cx={0} cy={10} rx={14} ry={13} fill={color} {...st} />
      <ellipse cx={13} cy={5} rx={6} ry={8} fill={color} {...st} transform="rotate(-30 13 5)" />
      {shape === "fist" && <path d="M -8 14 q 4 4 8 0 M 0 14 q 4 4 8 0" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />}
    </g>
  );
};

// ------------------------------------------------------------------ face

type Face = {
  lid: [number, number]; // upper lids, 0 open .. 1 closed (far eye, near eye)
  low: number; // lower lid (smiling eyes)
  brow: [number, number]; // brow angle; + = inner end up (worried)
  browY: number; // raise
  pupil: number; // pupil scale
  closed?: "happy" | "squeeze";
  mouth: "smile" | "grin" | "open" | "o" | "frown" | "wavy" | "smirk" | "grimace" | "flat" | "yell";
  sweat?: boolean;
  blush?: boolean;
};
const FACES: Record<Expr, Face> = {
  neutral: { lid: [0.12, 0.12], low: 0, brow: [0, 0], browY: 0, pupil: 1, mouth: "smile" },
  happy: { lid: [0.1, 0.1], low: 0.3, brow: [-4, -4], browY: 4, pupil: 1, mouth: "grin", blush: true },
  excited: { lid: [0, 0], low: 0.15, brow: [-8, -8], browY: 10, pupil: 1.15, mouth: "grin", blush: true },
  surprised: { lid: [0, 0], low: 0, brow: [6, 6], browY: 16, pupil: 0.7, mouth: "o" },
  worried: { lid: [0.2, 0.2], low: 0, brow: [22, 22], browY: 6, pupil: 0.9, mouth: "wavy", sweat: true },
  sour: { lid: [0.75, 0.3], low: 0.25, brow: [-18, 14], browY: 0, pupil: 1, mouth: "wavy" },
  pain: { lid: [1, 1], low: 0, brow: [24, 24], browY: 2, pupil: 1, closed: "squeeze", mouth: "grimace", sweat: true },
  cheeky: { lid: [0.35, 0.2], low: 0.15, brow: [-14, 10], browY: 4, pupil: 1, mouth: "smirk" },
  sleepy: { lid: [0.62, 0.62], low: 0, brow: [8, 8], browY: -4, pupil: 1, mouth: "flat" },
  laugh: { lid: [1, 1], low: 0, brow: [-6, -6], browY: 8, pupil: 1, closed: "happy", mouth: "yell", blush: true },
  scared: { lid: [0, 0], low: 0, brow: [26, 26], browY: 14, pupil: 0.55, mouth: "yell", sweat: true },
  proud: { lid: [1, 1], low: 0, brow: [-6, -6], browY: 6, pupil: 1, closed: "happy", mouth: "smile", blush: true },
  focused: { lid: [0.35, 0.35], low: 0.1, brow: [-14, -14], browY: -2, pupil: 1, mouth: "flat" },
};

const Mouth: React.FC<{ kind: Face["mouth"]; talk: Talk; w: number }> = ({ kind, talk, w }) => {
  const st = { stroke: INK, strokeWidth: OUT, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  // talking opens whatever mouth the expression has
  const open = talk === "wide" ? 1 : talk === "open" ? 0.6 : 0;
  const k = kind === "smile" || kind === "flat" || kind === "smirk" || kind === "wavy" || kind === "frown" ? (open ? "talk" : kind) : kind;
  if (k === "smile") return <path d={`M ${-w} -2 Q 0 ${w * 0.75} ${w} -2`} fill="none" {...st} />;
  if (k === "flat") return <path d={`M ${-w * 0.6} 2 Q 0 5 ${w * 0.6} 2`} fill="none" {...st} />;
  if (k === "frown") return <path d={`M ${-w * 0.8} 8 Q 0 -6 ${w * 0.8} 8`} fill="none" {...st} />;
  if (k === "smirk") return <path d={`M ${-w * 0.7} 4 Q ${w * 0.2} 10 ${w * 0.85} -6`} fill="none" {...st} />;
  if (k === "wavy") return <path d={`M ${-w * 0.8} 4 q ${w * 0.2} -7 ${w * 0.4} 0 t ${w * 0.4} 0 t ${w * 0.4} 0 t ${w * 0.4} 0`} fill="none" {...st} />;
  if (k === "grimace")
    return (
      <g>
        <rect x={-w * 0.85} y={-8} width={w * 1.7} height={18} rx={8} fill={WHITE} {...st} />
        <path d={`M ${-w * 0.85} 1 H ${w * 0.85} M ${-w * 0.3} -8 V 10 M ${w * 0.3} -8 V 10`} stroke={INK} strokeWidth={2.5} />
      </g>
    );
  // open shapes
  const h = k === "talk" ? 6 + 16 * open : k === "o" ? 18 + 8 * open : k === "yell" ? 26 + 6 * open : 14 + 12 * open;
  const ww = k === "o" ? w * 0.42 : k === "talk" ? w * (0.55 + 0.2 * open) : w * 0.85;
  const top = k === "o" ? -h / 2 : -2;
  const d = k === "o"
    ? `M ${-ww} 0 A ${ww} ${h / 2} 0 1 0 ${ww} 0 A ${ww} ${h / 2} 0 1 0 ${-ww} 0 Z`
    : `M ${-ww} ${top} Q 0 ${top - 3} ${ww} ${top} Q ${ww * 0.9} ${top + h * 1.15} 0 ${top + h * 1.15} Q ${-ww * 0.9} ${top + h * 1.15} ${-ww} ${top} Z`;
  return (
    <g>
      <path d={d} fill={MOUTH.inside} {...st} />
      <ellipse cx={0} cy={k === "o" ? h * 0.22 : top + h * 0.85} rx={ww * 0.55} ry={Math.max(3, h * 0.22)} fill={MOUTH.tongue} />
      {k === "grin" && <path d={`M ${-ww * 0.85} ${top + 1} Q 0 ${top + 2} ${ww * 0.85} ${top + 1} L ${ww * 0.72} ${top + 7} Q 0 ${top + 9} ${-ww * 0.72} ${top + 7} Z`} fill={WHITE} />}
      <path d={d} fill="none" {...st} />
    </g>
  );
};

let uidCounter = 0;
const Eye: React.FC<{ cx: number; cy: number; a: number; b: number; lid: number; low: number; pupil: number; look: P; skin: string; closed?: Face["closed"]; side: number; id: string }> = ({
  cx, cy, a, b, lid, low, pupil, look, skin, closed, side, id,
}) => {
  const st = { stroke: INK, strokeWidth: OUT, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (closed === "happy") return <path d={`M ${cx - a} ${cy + 3} Q ${cx} ${cy - b * 1.1} ${cx + a} ${cy + 3}`} fill="none" {...st} />;
  if (closed === "squeeze")
    return <path d={`M ${cx - a * side} ${cy - b * 0.6} L ${cx + a * 0.8 * side} ${cy} L ${cx - a * side} ${cy + b * 0.6}`} fill="none" {...st} />;
  const pr = a * 0.55 * pupil;
  const px = cx + look[0] * (a - pr) * 0.75;
  const py = cy + look[1] * (b - pr) * 0.6 + 2;
  return (
    <g>
      <defs>
        <clipPath id={id}><ellipse cx={cx} cy={cy} rx={a} ry={b} /></clipPath>
      </defs>
      <ellipse cx={cx} cy={cy} rx={a} ry={b} fill={WHITE} />
      <g clipPath={`url(#${id})`}>
        <circle cx={px} cy={py} r={pr} fill={INK} />
        <circle cx={px - pr * 0.35} cy={py - pr * 0.4} r={pr * 0.32} fill={WHITE} />
        {lid > 0.01 && (
          <>
            <rect x={cx - a - 2} y={cy - b - 2} width={2 * a + 4} height={2 * b * lid + 2} fill={skin} />
            <path d={`M ${cx - a - 2} ${cy - b + 2 * b * lid} H ${cx + a + 2}`} stroke={INK} strokeWidth={OUT} />
          </>
        )}
        {low > 0.01 && (
          <path d={`M ${cx - a - 2} ${cy + b + 2} V ${cy + b - 2 * b * low + 4} Q ${cx} ${cy + b - 2 * b * low - 4} ${cx + a + 2} ${cy + b - 2 * b * low + 4} V ${cy + b + 2} Z`}
            fill={skin} stroke={INK} strokeWidth={OUT} />
        )}
      </g>
      <ellipse cx={cx} cy={cy} rx={a} ry={b} fill="none" {...st} />
    </g>
  );
};

/** The head: monkey or human, any expression, turn = -1..1 for a three-quarter view. */
export const Head: React.FC<{ d: Design; expr: Expr; talk: Talk; look: P; blink: boolean; turn: number }> = ({ d, expr, talk, look, blink, turn }) => {
  const id = React.useMemo(() => `h${uidCounter++}`, []);
  const R = d.R;
  const f = FACES[expr];
  const lid: [number, number] = blink && !f.closed ? [1, 1] : f.lid;
  const t = turn * R * 0.22;
  const st = { stroke: INK, strokeWidth: OUT, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const monkey = d.kind === "monkey";
  const faceSkin = monkey ? MONKEY.face : d.skin;
  const eyeY = monkey ? -R * 0.12 : -R * 0.06;
  const eyeDX = monkey ? R * 0.29 : R * 0.3;
  const a = monkey ? R * 0.19 : R * 0.15;
  const b = monkey ? R * 0.24 : R * 0.19;
  const browC = monkey ? MONKEY.tuft : d.hair ?? INK;
  const brow = (side: -1 | 1, i: 0 | 1) => {
    const cx = t + side * eyeDX;
    const cy = eyeY - b - 9 - f.browY;
    const ang = f.brow[i] * -side;
    return <path key={side} d={`M ${cx - a * 0.95} ${cy} Q ${cx} ${cy - 6} ${cx + a * 0.95} ${cy}`} transform={`rotate(${ang} ${cx} ${cy})`}
      stroke={browC} strokeWidth={monkey ? 7 : 6} fill="none" strokeLinecap="round" />;
  };

  return (
    <g>
      {/* behind the head: ears and back hair */}
      {monkey && (
        <>
          {[-1, 1].map((s) => (
            <g key={s}>
              <circle cx={s * R * 0.98 - turn * R * 0.12} cy={-R * 0.08} r={R * 0.36} fill={MONKEY.fur} {...st} />
              <circle cx={s * R * 0.98 - turn * R * 0.12} cy={-R * 0.08} r={R * 0.2} fill={MONKEY.faceShade} />
            </g>
          ))}
        </>
      )}
      {!monkey && d.backHair?.(R)}
      {!monkey && [-1, 1].map((s) => <circle key={s} cx={s * R * 0.97 - turn * R * 0.1} cy={R * 0.05} r={R * 0.18} fill={d.skin} {...st} />)}

      {/* the skull with one cel shadow */}
      <defs><clipPath id={`${id}c`}><circle cx={0} cy={0} r={R} /></clipPath></defs>
      <circle cx={0} cy={0} r={R} fill={monkey ? MONKEY.furShade : d.skinShade} />
      <g clipPath={`url(#${id}c)`}>
        <circle cx={-R * 0.1} cy={-R * 0.12} r={R * 0.98} fill={monkey ? MONKEY.fur : d.skin} />
      </g>
      <circle cx={0} cy={0} r={R} fill="none" {...st} />

      {monkey && (
        <>
          {/* the face mask: two eye lobes and a muzzle, outlined as one shape */}
          <Union fill={MONKEY.face} o={3.5} shapes={[
            { el: "circle", p: { cx: t - R * 0.29, cy: -R * 0.1, r: R * 0.38 } },
            { el: "circle", p: { cx: t + R * 0.29, cy: -R * 0.1, r: R * 0.38 } },
            { el: "ellipse", p: { cx: t, cy: R * 0.36, rx: R * 0.56, ry: R * 0.4 } },
          ]} />
          <path d={`M ${t - R * 0.4} ${R * 0.6} Q ${t} ${R * 0.82} ${t + R * 0.4} ${R * 0.6}`} stroke={MONKEY.faceShade} strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* tuft */}
          <path d={`M ${-R * 0.26 + t * 0.4} ${-R * 0.9} Q ${-R * 0.3} ${-R * 1.32} ${-R * 0.02} ${-R * 1.1} Q ${R * 0.06} ${-R * 1.42} ${R * 0.22} ${-R * 1.08} Q ${R * 0.42} ${-R * 1.24} ${R * 0.3 + t * 0.4} ${-R * 0.88} Z`}
            fill={MONKEY.tuft} {...st} />
          {/* nose */}
          <ellipse cx={t} cy={R * 0.17} rx={R * 0.12} ry={R * 0.07} fill={MONKEY.tuft} {...st} strokeWidth={3} />
        </>
      )}
      {!monkey && d.frontHair?.(R, t)}
      {!monkey && d.wrinkles && (
        <path d={`M ${t - R * 0.62} ${eyeY - 2} q -6 6 0 12 M ${t + R * 0.62} ${eyeY - 2} q 6 6 0 12 M ${t - R * 0.2} ${-R * 0.55} q ${R * 0.2} -6 ${R * 0.4} 0`}
          stroke={d.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" />
      )}
      {f.blush && <>
        <ellipse cx={t - R * 0.5} cy={R * 0.26} rx={R * 0.14} ry={R * 0.08} fill={ACCENT.red} opacity={0.28} />
        <ellipse cx={t + R * 0.5} cy={R * 0.26} rx={R * 0.14} ry={R * 0.08} fill={ACCENT.red} opacity={0.28} />
      </>}

      <Eye id={`${id}l`} cx={t - eyeDX} cy={eyeY} a={a} b={b} lid={lid[0]} low={f.low} pupil={f.pupil} look={look} skin={faceSkin} closed={f.closed} side={-1} />
      <Eye id={`${id}r`} cx={t + eyeDX} cy={eyeY} a={a} b={b} lid={lid[1]} low={f.low} pupil={f.pupil} look={look} skin={faceSkin} closed={f.closed} side={1} />
      {brow(-1, 0)}{brow(1, 1)}
      {!monkey && <path d={`M ${t + 3} ${R * 0.08} q ${8 + turn * 6} ${R * 0.12} 0 ${R * 0.2}`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />}
      {!monkey && d.beard?.(R, t)}
      <g transform={`translate(${t + (monkey ? 0 : turn * 4)} ${monkey ? R * 0.42 : R * 0.48})`}>
        <Mouth kind={f.mouth} talk={talk} w={monkey ? R * 0.3 : R * 0.24} />
      </g>
      {f.sweat && <path d={`M ${R * 0.78} ${-R * 0.55} q -10 18 0 24 q 10 -6 0 -24 Z`} fill="#bfe6fa" {...st} strokeWidth={3} />}
    </g>
  );
};

// ------------------------------------------------------------------ the figure

export type Hands = { near: P; far: P; nearAng: number; farAng: number };

type Props = {
  d: Design;
  x: number;
  y: number; // the ground line
  pose: Pose;
  expr?: Expr;
  talk?: Talk;
  look?: P;
  blink?: boolean;
  face?: 1 | -1;
  turn?: number;
  scale?: number;
  seat?: number; // hip height above the ground when sitting
  hands?: [HandShape, HandShape]; // far, near
  tail?: number; // tail sway, degrees
  hold?: (h: Hands) => React.ReactNode; // drawn above the near arm, in the torso's frame
  holdBehind?: (h: Hands) => React.ReactNode;
  squash?: number; // + = squash, - = stretch (anticipation, landing)
};

export const Figure: React.FC<Props> = ({
  d, x, y, pose, expr = "neutral", talk = "closed", look = [0.2, 0], blink = false, face = 1, turn = 0.25,
  scale = 1, seat, hands = ["open", "open"], tail = 0, hold, holdBehind, squash = 0,
}) => {
  const B = d.body;
  const LEG = [62 * B, 60 * B];
  const ARM = [48 * B, 46 * B];
  const T = 98 * B; // torso
  // shoulders and hips sit at the sides of the body: the figures face the viewer three-quarter
  const hipF: P = [-13 * B, 0];
  const hipN: P = [13 * B, 0];
  const kneeF = step(hipF, pose.ll[0], LEG[0]);
  const footF = step(kneeF, pose.ll[0] + pose.ll[1], LEG[1]);
  const kneeN = step(hipN, pose.rl[0], LEG[0]);
  const footN = step(kneeN, pose.rl[0] + pose.rl[1], LEG[1]);
  const reach = seat ?? Math.max(footF[1], footN[1]) + 10 * B;
  const shF: P = [-27 * B, -T + 16 * B];
  const shN: P = [27 * B, -T + 16 * B];
  const elF = step(shF, pose.la[0], ARM[0]);
  const hF = step(elF, pose.la[0] + pose.la[1], ARM[1]);
  const elN = step(shN, pose.ra[0], ARM[0]);
  const hN = step(elN, pose.ra[0] + pose.ra[1], ARM[1]);
  const hd: Hands = { far: hF, near: hN, farAng: pose.la[0] + pose.la[1], nearAng: pose.ra[0] + pose.ra[1] };
  const q = (a: P, c: P, e: P) => `M ${a[0]} ${a[1]} Q ${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
  const lerpP = (a: P, b: P, k: number): P => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const monkey = d.kind === "monkey";
  const armW = 15 * B;
  const legW = (monkey ? 22 : 20) * B;
  const st = { stroke: INK, strokeWidth: OUT, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

  const leg = (hipP: P, knee: P, foot: P, ang: number, key: string, splay = false) => {
    const covered = d.legs.cover; // 0..1 of the leg in clothing
    const cut = covered >= 1 ? foot : covered <= 0.5 ? lerpP(hipP, knee, covered * 2) : lerpP(knee, foot, (covered - 0.5) * 2);
    return (
      <g key={key}>
        <Tube d={q(hipP, knee, foot)} w={legW * 0.82} fill={d.skin} />
        {covered > 0 && <Tube d={covered <= 0.5 ? `M ${hipP[0]} ${hipP[1]} L ${cut[0]} ${cut[1]}` : `${q(hipP, knee, cut)}`} w={legW * 1.08} fill={d.legs.color} />}
        {d.legs.wrap && <Tube d={`M ${lerpP(knee, foot, 0.62)[0]} ${lerpP(knee, foot, 0.62)[1]} L ${foot[0]} ${foot[1]}`} w={legW * 0.98} fill={d.legs.wrap} />}
        <g transform={`translate(${foot[0]} ${foot[1]}) rotate(${-(ang) * 0.25}) scale(${splay ? -1 : 1} 1)`}>
          <path d={`M -10 -6 Q -12 10 4 10 L 22 10 Q 30 9 28 0 Q 24 -9 8 -8 Z`} transform={`scale(${B})`} fill={d.feet} {...st} />
        </g>
      </g>
    );
  };

  const arm = (s: P, el: P, h: P, sleeve: number, key: string) => (
    <g key={key}>
      <Tube d={q(s, el, h)} w={armW} fill={d.hand} />
      {sleeve > 0 && <Tube d={sleeve >= 1 ? q(s, el, lerpP(el, h, 0.8)) : `M ${s[0]} ${s[1]} L ${lerpP(s, el, sleeve * 2)[0]} ${lerpP(s, el, sleeve * 2)[1]}`}
        w={armW * (sleeve >= 1 ? 1.25 : 1.6)} fill={d.top.color} />}
    </g>
  );

  const tailD = (() => {
    const s = tail;
    const c1: P = [-70 + s * 0.5, 14];
    const c2: P = [-118 + s, -30 - s * 0.4];
    const e: P = [-104 + s * 1.3, -96 - s * 0.2];
    return `M -18 -6 C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${e[0]} ${e[1]} C ${e[0] + 6} ${e[1] - 46}, ${e[0] + 56} ${e[1] - 44}, ${e[0] + 50} ${e[1] - 10} C ${e[0] + 46} ${e[1] + 10}, ${e[0] + 22} ${e[1] + 4}, ${e[0] + 26} ${e[1] - 12}`;
  })();

  const top = d.top;
  const torso = (
    <g>
      {/* skirt / long tunic below the hip */}
      {top.skirt && (
        <path d={`M ${-34 * B} ${-6 * B} L ${34 * B} ${-6 * B} L ${44 * B} ${top.skirt * B} ${top.fringe ? Array.from({ length: 8 }, (_, i) => `L ${(44 - (i + 0.5) * 11) * B} ${(top.skirt! + (i % 2 ? 0 : 10)) * B}`).join(" ") : ""} L ${-44 * B} ${top.skirt * B} Z`}
          fill={top.color} {...st} />
      )}
      {/* trouser top / belt */}
      <path d={`M ${-36 * B} ${-20 * B} L ${36 * B} ${-20 * B} L ${38 * B} ${4 * B} Q 0 ${12 * B} ${-38 * B} ${4 * B} Z`} fill={top.skirt ? top.color : d.legs.color} {...st} />
      {/* the torso */}
      <path d={`M ${-30 * B} ${-T} Q 0 ${-T - 8 * B} ${30 * B} ${-T} Q ${40 * B} ${-T * 0.5} ${36 * B} ${-14 * B} Q 0 ${-6 * B} ${-36 * B} ${-14 * B} Q ${-40 * B} ${-T * 0.5} ${-30 * B} ${-T} Z`}
        fill={top.color} />
      <path d={`M ${-36 * B} ${-14 * B} Q 0 ${-6 * B} ${36 * B} ${-14 * B} L ${38 * B} ${-30 * B} Q 0 ${-20 * B} ${-38 * B} ${-30 * B} Z`} fill={top.shade} />
      <ellipse cx={0} cy={-T + 6 * B} rx={26 * B} ry={12 * B} fill={top.shade} />
      <path d={`M ${-30 * B} ${-T} Q 0 ${-T - 8 * B} ${30 * B} ${-T} Q ${40 * B} ${-T * 0.5} ${36 * B} ${-14 * B} Q 0 ${-6 * B} ${-36 * B} ${-14 * B} Q ${-40 * B} ${-T * 0.5} ${-30 * B} ${-T} Z`}
        fill="none" {...st} />
      {top.style === "shirt" && (
        <>
          {/* collar and red tie */}
          <path d={`M ${-17 * B} ${-T - 2} L 0 ${-T + 14 * B} L ${-6 * B} ${-T + 22 * B} L ${-22 * B} ${-T + 8 * B} Z`} fill={WHITE} {...st} strokeWidth={3.5} />
          <path d={`M ${17 * B} ${-T - 2} L 0 ${-T + 14 * B} L ${6 * B} ${-T + 22 * B} L ${22 * B} ${-T + 8 * B} Z`} fill={WHITE} {...st} strokeWidth={3.5} />
          <path d={`M ${-6 * B} ${-T + 12 * B} L ${6 * B} ${-T + 12 * B} L ${4 * B} ${-T + 21 * B} L ${-4 * B} ${-T + 21 * B} Z`} fill={MONKEY.tie} {...st} strokeWidth={3.5} />
          <path d={`M ${-4 * B} ${-T + 21 * B} L ${4 * B} ${-T + 21 * B} L ${9 * B} ${-T + 62 * B} L 0 ${-T + 72 * B} L ${-9 * B} ${-T + 62 * B} Z`} fill={MONKEY.tie} {...st} strokeWidth={3.5} />
          <path d={`M ${2 * B} ${-T + 24 * B} L ${6 * B} ${-T + 60 * B} L 0 ${-T + 68 * B}`} stroke={MONKEY.tieShade} strokeWidth={3} fill="none" />
          <path d={`M ${14 * B} ${-T + 34 * B} h ${14 * B}`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </>
      )}
      {top.style === "vest" && (
        <>
          <path d={`M ${-6 * B} ${-T + 2} L ${-2 * B} ${-24 * B} M ${6 * B} ${-T + 2} L ${2 * B} ${-24 * B}`} stroke={HIDE.fur} strokeWidth={14 * B} strokeLinecap="round" />
          <path d={`M ${-6 * B} ${-T + 2} L ${-2 * B} ${-24 * B} M ${6 * B} ${-T + 2} L ${2 * B} ${-24 * B}`} stroke={INK} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="3 7" />
        </>
      )}
      {top.trim && (
        <path d={`M ${-30 * B} ${-T + 2} Q 0 ${-T + 18 * B} ${30 * B} ${-T + 2}`} stroke={top.trim} strokeWidth={14 * B} fill="none" strokeLinecap="round" />
      )}
      {top.trim && (
        <path d={`M ${-30 * B} ${-T + 2} Q 0 ${-T + 18 * B} ${30 * B} ${-T + 2}`} stroke={INK} strokeWidth={2.5} fill="none" strokeDasharray="2 6" strokeLinecap="round" />
      )}
      {d.necklace && Array.from({ length: 7 }, (_, i) => {
        const a = -0.9 + (i / 6) * 1.8;
        return <circle key={i} cx={Math.sin(a) * 22 * B} cy={-T + 18 * B + Math.cos(a) * 10 * B} r={4.5 * B} fill={i % 2 ? ACCENT.bead : ACCENT.teal} stroke={INK} strokeWidth={2} />;
      })}
      {d.belt && (
        <>
          <path d={`M ${-37 * B} ${-18 * B} Q 0 ${-8 * B} ${37 * B} ${-18 * B}`} stroke={HIDE.leather} strokeWidth={9 * B} fill="none" />
          <path d={`M ${-37 * B} ${-18 * B} Q 0 ${-8 * B} ${37 * B} ${-18 * B}`} stroke={INK} strokeWidth={2} fill="none" />
          {d.pouch && <path d={`M ${-30 * B} ${-16 * B} h ${18 * B} v ${18 * B} q ${-9 * B} ${8 * B} ${-18 * B} 0 Z`} fill={HIDE.leather} {...st} strokeWidth={3} />}
        </>
      )}
    </g>
  );

  const sq = 1 + squash;
  return (
    <g transform={`translate(${x} ${y}) scale(${face * scale * (1 + squash * 0.5)} ${scale / sq})`}>
      <ellipse cx={0} cy={0} rx={seat ? 62 * B : 46 * B} ry={9 * B} fill={INK} opacity={0.16} />
      <g transform={`translate(0 ${-reach})`}>
        {monkey && <Tube d={tailD} w={11} fill={MONKEY.fur} />}
        <g transform={`rotate(${pose.lean})`}>
          {holdBehind?.(hd)}
          {arm(shF, elF, hF, d.sleeve, "af")}
          <Hand at={hF} ang={hd.farAng} shape={hands[0]} color={d.hand} s={B} />
        </g>
        {leg(hipF, kneeF, footF, pose.ll[0] + pose.ll[1], "lf", Math.abs(pose.ll[0]) < 16 && Math.abs(pose.ll[1]) < 20)}
        {leg(hipN, kneeN, footN, pose.rl[0] + pose.rl[1], "ln")}
        <g transform={`rotate(${pose.lean})`}>
          {torso}
          <g transform={`translate(0 ${-T - d.R * 0.78}) rotate(${pose.tilt} 0 ${d.R * 0.78})`}>
            <Head d={d} expr={expr} talk={talk} look={look} blink={blink} turn={turn} />
          </g>
          {arm(shN, elN, hN, d.sleeve, "an")}
          <Hand at={hN} ang={hd.nearAng} shape={hands[1]} color={d.hand} s={B} />
          {hold?.(hd)}
        </g>
      </g>
    </g>
  );
};
