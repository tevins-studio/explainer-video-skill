import React from "react";
import type { Pose } from "../toon/poses";

/** The house stickman. One rig for every character, the monkey presenter included.
 *  Round head, small understated face, thin black stick limbs, a simple clothing shape, minimal
 *  colour. Same conventions as poses.ts: degrees, 0 = hanging down, + = towards the facing side,
 *  lower angles relative to the upper ones. Local space: facing right, origin on the ground. */

export const INK = "#1f1a17";
const LINE = 6.5; // limb weight
const OUT = 3.5; // outline weight of heads and clothing

export type Mood =
  | "neutral" | "smile" | "talk" | "surprised" | "worried" | "sour" | "pain" | "laugh"
  | "cheeky" | "focused" | "sleepy" | "proud" | "scared";
export type Talk = "closed" | "open" | "wide";

export type StickDesign = {
  id: string;
  monkey?: boolean;
  R: number; // head radius
  size: number; // body scale (child < 1)
  head: string; // head / skin colour
  face?: string; // monkey face mask
  hair?: (R: number) => React.ReactNode; // drawn over the head
  hairBack?: (R: number) => React.ReactNode; // drawn behind the head
  beard?: (R: number) => React.ReactNode;
  top: { color: string; len: number; flare?: number; fringe?: boolean; collar?: string };
  sleeve?: number; // 0..1 of the upper arm covered (1 = long sleeves to the wrist)
  legs?: { color: string; to: number }; // trousers / leggings: 0..1 of the leg covered
  tie?: string;
  necklace?: string[];
  belt?: string;
  feet?: string;
};

type P = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const step = (p: P, a: number, l: number): P => [p[0] + Math.sin(rad(a)) * l, p[1] + Math.cos(rad(a)) * l];
const lerp = (a: P, b: P, k: number): P => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const seg = (a: P, b: P) => `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`;
const stick = { stroke: INK, strokeWidth: LINE, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ol = { stroke: INK, strokeWidth: OUT, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** A coloured tube with a thin ink edge: trousers, sleeves, tail. */
const Tube: React.FC<{ d: string; w: number; c: string }> = ({ d, w, c }) => (
  <>
    <path d={d} stroke={INK} strokeWidth={w + 2 * 2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

// ------------------------------------------------------------------ the face: small and understated

const Face: React.FC<{ mood: Mood; talk: Talk; blink: boolean; look: P; R: number; monkey?: boolean }> = ({ mood, talk, blink, look, R, monkey }) => {
  const k = R / 44;
  const ex = 12 * k;
  const ey = (monkey ? -4 : -3) * k;
  const lx = look[0] * 3 * k;
  const ly = look[1] * 2 * k;
  const my = (monkey ? 17 : 15) * k;
  const s = { stroke: INK, strokeWidth: 3 * k, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const dot = (x: number) => <circle cx={x + lx} cy={ey + ly} r={3.6 * k} fill={INK} />;
  const eyes = (() => {
    if (blink || mood === "laugh" || mood === "proud") {
      return <path d={`M ${-ex - 4 * k} ${ey} Q ${-ex} ${ey - 4 * k} ${-ex + 4 * k} ${ey} M ${ex - 4 * k} ${ey} Q ${ex} ${ey - 4 * k} ${ex + 4 * k} ${ey}`} {...s} />;
    }
    if (mood === "pain") return <path d={`M ${-ex - 4 * k} ${ey - 3 * k} L ${-ex + 3 * k} ${ey} L ${-ex - 4 * k} ${ey + 3 * k} M ${ex + 4 * k} ${ey - 3 * k} L ${ex - 3 * k} ${ey} L ${ex + 4 * k} ${ey + 3 * k}`} {...s} />;
    if (mood === "sleepy") return <path d={`M ${-ex - 4 * k} ${ey + 1} L ${-ex + 4 * k} ${ey + 1} M ${ex - 4 * k} ${ey + 1} L ${ex + 4 * k} ${ey + 1}`} {...s} />;
    if (mood === "surprised" || mood === "scared") {
      return <>{[-ex, ex].map((x) => <g key={x}><circle cx={x} cy={ey} r={5.4 * k} fill="#fff" stroke={INK} strokeWidth={2.2 * k} /><circle cx={x + lx * 0.5} cy={ey + ly * 0.5} r={2.2 * k} fill={INK} /></g>)}</>;
    }
    if (mood === "sour") return <>{dot(-ex)}<path d={`M ${ex - 4 * k} ${ey} L ${ex + 4 * k} ${ey}`} {...s} /></>;
    return <>{dot(-ex)}{dot(ex)}</>;
  })();
  // brows: short strokes, the main carrier of the mood
  const brow: Record<Mood, [number, number, number]> = {
    // [inner-end lift, outer-end lift, height]
    neutral: [0, 0, 0], smile: [1, 1, 1], talk: [1, 0, 1], surprised: [3, 3, 4], worried: [4, -1, 2],
    sour: [3, -1, 0], pain: [4, -1, 1], laugh: [1, 1, 2], cheeky: [0, 1, 1], focused: [-3, 0, -1],
    sleepy: [-1, -1, -2], proud: [0, 1, 2], scared: [5, 0, 4],
  };
  const [bi, bo, bh] = brow[mood];
  const by = ey - 10 * k - bh * k;
  const brows = (
    <path d={`M ${-ex - 6 * k} ${by - bo * k} L ${-ex + 5 * k} ${by - bi * k} M ${ex - 5 * k} ${by - (mood === "cheeky" ? 3 : bi) * k} L ${ex + 6 * k} ${by - (mood === "cheeky" ? 5 : bo) * k}`}
      {...s} strokeWidth={2.6 * k} />
  );
  const open = talk === "wide" ? 1 : talk === "open" ? 0.55 : 0;
  const mouth = (() => {
    const w = 8 * k;
    if (open > 0 || mood === "surprised" || mood === "scared" || mood === "laugh") {
      const h = (mood === "laugh" ? 9 : mood === "scared" ? 8 : mood === "surprised" ? 6 : 3 + 6 * open) * k;
      const ww = (mood === "surprised" ? 4.5 : mood === "laugh" ? 8 : 5 + 3 * open) * k;
      return <ellipse cx={0} cy={my + h * 0.3} rx={ww} ry={h * 0.6} fill={INK} />;
    }
    if (mood === "smile" || mood === "proud") return <path d={`M ${-w} ${my - 2 * k} Q 0 ${my + 6 * k} ${w} ${my - 2 * k}`} {...s} />;
    if (mood === "cheeky") return <path d={`M ${-w * 0.7} ${my} Q ${w * 0.2} ${my + 4 * k} ${w} ${my - 4 * k}`} {...s} />;
    if (mood === "worried" || mood === "sour") return <path d={`M ${-w} ${my + 2 * k} q ${w / 2} -4 ${w} 0 t ${w} 0`} {...s} />;
    if (mood === "pain") return <path d={`M ${-w} ${my} L ${w} ${my}`} {...s} strokeWidth={4 * k} />;
    if (mood === "focused" || mood === "sleepy") return <path d={`M ${-w * 0.6} ${my} L ${w * 0.6} ${my}`} {...s} />;
    return <path d={`M ${-w * 0.8} ${my - 1 * k} Q 0 ${my + 3 * k} ${w * 0.8} ${my - 1 * k}`} {...s} />;
  })();
  return <g>{eyes}{brows}{mouth}</g>;
};

// ------------------------------------------------------------------ the figure

export type Hands = { near: P; far: P; nearAng: number; farAng: number };

type Props = {
  d: StickDesign;
  x: number;
  y: number;
  pose: Pose;
  mood?: Mood;
  talk?: Talk;
  blink?: boolean;
  look?: P;
  face?: 1 | -1;
  turn?: number; // -1..1: the face shifts towards the look direction (three-quarter)
  scale?: number;
  seat?: number;
  tail?: number;
  hold?: (h: Hands) => React.ReactNode;
  holdBehind?: (h: Hands) => React.ReactNode;
};

export const Stickman: React.FC<Props> = ({
  d, x, y, pose, mood = "neutral", talk = "closed", blink = false, look = [0.3, 0], face = 1, turn = 0.3,
  scale = 1, seat, tail = 0, hold, holdBehind,
}) => {
  const S = d.size;
  const T = 94 * S; // torso
  const LEG: [number, number] = [66 * S, 64 * S];
  const ARM: [number, number] = [54 * S, 50 * S];
  const R = d.R;
  const hipF: P = [-8 * S, 0];
  const hipN: P = [8 * S, 0];
  const kF = step(hipF, pose.ll[0], LEG[0]);
  const fF = step(kF, pose.ll[0] + pose.ll[1], LEG[1]);
  const kN = step(hipN, pose.rl[0], LEG[0]);
  const fN = step(kN, pose.rl[0] + pose.rl[1], LEG[1]);
  const reach = seat ?? Math.max(fF[1], fN[1]) + 6;
  const shF: P = [-14 * S, -T + 12 * S];
  const shN: P = [14 * S, -T + 12 * S];
  const eF = step(shF, pose.la[0], ARM[0]);
  const hF = step(eF, pose.la[0] + pose.la[1], ARM[1]);
  const eN = step(shN, pose.ra[0], ARM[0]);
  const hN = step(eN, pose.ra[0] + pose.ra[1], ARM[1]);
  const hd: Hands = { far: hF, near: hN, farAng: pose.la[0] + pose.la[1], nearAng: pose.ra[0] + pose.ra[1] };
  const top = d.top;
  const shoulder = 21 * S;
  const waist = 19 * S;
  const len = top.len * S; // how far the garment reaches below the hip
  const flare = (top.flare ?? 0) * S;

  const leg = (h: P, k: P, f: P, key: string) => {
    const to = d.legs?.to ?? 0;
    const cut = to <= 0.5 ? lerp(h, k, to * 2) : lerp(k, f, (to - 0.5) * 2);
    const path = to <= 0.5 ? seg(h, cut) : `M ${h[0]} ${h[1]} L ${k[0]} ${k[1]} L ${cut[0]} ${cut[1]}`;
    return (
      <g key={key}>
        <path d={`M ${h[0]} ${h[1]} L ${k[0]} ${k[1]} L ${f[0]} ${f[1]}`} {...stick} />
        {d.legs && to > 0 && <Tube d={path} w={9 * S} c={d.legs.color} />}
        <ellipse cx={f[0] + 6 * S} cy={f[1] + 1} rx={11 * S} ry={5.5 * S} fill={d.feet ?? INK} stroke={INK} strokeWidth={2} />
      </g>
    );
  };
  const arm = (s: P, e: P, h: P, key: string) => (
    <g key={key}>
      <path d={`M ${s[0]} ${s[1]} L ${e[0]} ${e[1]} L ${h[0]} ${h[1]}`} {...stick} />
      {(d.sleeve ?? 0) > 0 && (
        <Tube d={(d.sleeve ?? 0) >= 1 ? `M ${s[0]} ${s[1]} L ${e[0]} ${e[1]} L ${lerp(e, h, 0.8)[0]} ${lerp(e, h, 0.8)[1]}` : seg(s, lerp(s, e, d.sleeve!))}
          w={12 * S} c={top.color} />
      )}
      <circle cx={h[0]} cy={h[1]} r={5.2 * S} fill={INK} />
    </g>
  );

  // the garment: one clean shape from the shoulders to below the hips
  const garment = `M ${-shoulder} ${-T + 4 * S} Q 0 ${-T - 3 * S} ${shoulder} ${-T + 4 * S}
    L ${waist + flare} ${len} ${top.fringe ? Array.from({ length: 6 }, (_, i) => `L ${waist + flare - ((i + 0.5) * 2 * (waist + flare)) / 6} ${len + (i % 2 ? 0 : 7 * S)}`).join(" ") : ""}
    L ${-waist - flare} ${len} Z`;

  const monkey = !!d.monkey;
  const ht = turn * R * 0.16; // features shift for a three-quarter look
  const tailD = `M -10 ${-4 * S} C ${-60 + tail * 0.4} 10, ${-96 + tail} -30, ${-86 + tail * 1.2} -86 C ${-80 + tail} -124, ${-36 + tail} -122, ${-40 + tail} -92 C ${-43 + tail} -72, ${-62 + tail} -78, ${-58 + tail} -94`;

  return (
    <g transform={`translate(${x} ${y}) scale(${face * scale} ${scale})`}>
      <ellipse cx={0} cy={0} rx={(seat ? 54 : 36) * S} ry={6 * S} fill={INK} opacity={0.16} />
      <g transform={`translate(0 ${-reach})`}>
        {monkey && <Tube d={tailD} w={5} c={d.head} />}
        <g transform={`rotate(${pose.lean})`}>
          {holdBehind?.(hd)}
          {arm(shF, eF, hF, "af")}
        </g>
        {leg(hipF, kF, fF, "lf")}
        {leg(hipN, kN, fN, "ln")}
        <g transform={`rotate(${pose.lean})`}>
          <path d={garment} fill={top.color} {...ol} />
          {top.collar && <path d={`M ${-shoulder * 0.9} ${-T + 4 * S} Q 0 ${-T + 18 * S} ${shoulder * 0.9} ${-T + 4 * S}`} stroke={top.collar} strokeWidth={8 * S} fill="none" strokeLinecap="round" />}
          {d.tie && (
            <>
              <path d={`M ${-9 * S} ${-T + 1} L 0 ${-T + 11 * S} L ${-3 * S} ${-T + 15 * S} L ${-12 * S} ${-T + 6 * S} Z M ${9 * S} ${-T + 1} L 0 ${-T + 11 * S} L ${3 * S} ${-T + 15 * S} L ${12 * S} ${-T + 6 * S} Z`}
                fill="#fffaf0" stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
              <path d={`M ${-3.5 * S} ${-T + 10 * S} L ${3.5 * S} ${-T + 10 * S} L ${2.5 * S} ${-T + 16 * S} L ${5 * S} ${-T + 50 * S} L 0 ${-T + 57 * S} L ${-5 * S} ${-T + 50 * S} L ${-2.5 * S} ${-T + 16 * S} Z`}
                fill={d.tie} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
            </>
          )}
          {d.necklace && d.necklace.map((c, i) => {
            const n = d.necklace!.length;
            const a = -0.9 + (i / (n - 1)) * 1.8;
            return <circle key={i} cx={Math.sin(a) * 13 * S} cy={-T + 9 * S + Math.cos(a) * 7 * S} r={3.2 * S} fill={c} stroke={INK} strokeWidth={1.6} />;
          })}
          {d.belt && <path d={`M ${-waist - 1} ${-6 * S} L ${waist + 1} ${-6 * S}`} stroke={d.belt} strokeWidth={6 * S} />}
          {d.belt && <path d={`M ${-waist - 1} ${-6 * S} L ${waist + 1} ${-6 * S}`} stroke={INK} strokeWidth={1.6} strokeDasharray="0" opacity={0.6} />}
          {/* neck */}
          <path d={`M 0 ${-T + 2} L 0 ${-T - 8 * S}`} {...stick} strokeWidth={LINE * 0.9} />
          {/* head */}
          <g transform={`translate(0 ${-T - 8 * S - R + 2}) rotate(${pose.tilt} 0 ${R})`}>
            {monkey && [-1, 1].map((sd) => (
              <g key={sd}>
                <circle cx={sd * (R + 2) - ht * 0.8} cy={-R * 0.05} r={R * 0.3} fill={d.head} {...ol} />
                <circle cx={sd * (R + 2) - ht * 0.8} cy={-R * 0.05} r={R * 0.15} fill={d.face} />
              </g>
            ))}
            {d.hairBack?.(R)}
            <circle cx={0} cy={0} r={R} fill={d.head} {...ol} />
            {monkey && (
              <g transform={`translate(${ht} 0)`}>
                {/* the face mask: a soft heart shape and a muzzle, one outline */}
                <path d={`M 0 ${-R * 0.34} C ${R * 0.2} ${-R * 0.62}, ${R * 0.74} ${-R * 0.5}, ${R * 0.66} ${-R * 0.02}
                  C ${R * 0.7} ${R * 0.36}, ${R * 0.5} ${R * 0.7}, 0 ${R * 0.72} C ${-R * 0.5} ${R * 0.7}, ${-R * 0.7} ${R * 0.36}, ${-R * 0.66} ${-R * 0.02}
                  C ${-R * 0.74} ${-R * 0.5}, ${-R * 0.2} ${-R * 0.62}, 0 ${-R * 0.34} Z`} fill={d.face} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
                <circle cx={-3} cy={R * 0.17} r={1.9} fill={INK} />
                <circle cx={3} cy={R * 0.17} r={1.9} fill={INK} />
              </g>
            )}
            {monkey && <path d={`M ${-R * 0.18} ${-R * 0.94} Q ${-R * 0.24} ${-R * 1.3} ${-R * 0.02} ${-R * 1.1} Q ${R * 0.04} ${-R * 1.36} ${R * 0.18} ${-R * 1.06} Q ${R * 0.36} ${-R * 1.2} ${R * 0.24} ${-R * 0.92} Z`} fill="#4b2e17" {...ol} strokeWidth={2.6} />}
            {d.hair?.(R)}
            <g transform={`translate(${ht} 0)`}>
              <Face mood={mood} talk={talk} blink={blink} look={look} R={R} monkey={monkey} />
              {d.beard?.(R)}
            </g>
          </g>
          {arm(shN, eN, hN, "an")}
          {hold?.(hd)}
        </g>
      </g>
    </g>
  );
};

/** A thin light keyline around every character, so a stickman reads on a busy background.
 *  Put <KeylineDefs /> once in a scene's <svg>, then wrap the characters in <g filter="url(#keyline)">. */
export const KeylineDefs: React.FC = () => (
  <defs>
    <filter id="keyline" x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="3.2" result="d" />
      <feFlood floodColor="#fffaf0" floodOpacity="0.85" />
      <feComposite in2="d" operator="in" result="k" />
      <feMerge><feMergeNode in="k" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);
