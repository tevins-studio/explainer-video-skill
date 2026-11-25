import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { KeylineDefs, Stickman } from "../stick/Stickman";
import type { Mood } from "../stick/Stickman";
import { AMA_STICK, MONKEY_STICK as M, NANA_STICK, ORU_STICK, TUK_STICK } from "../stick/stickCast";
import { CHEER, HOLD_UP, POINT, REACH, SHRUG, SIT, STAND, THINK, WAVE, run, tweak, walk } from "../toon/poses";
import { Basket, Berry, Flint, Stick } from "../toon/props";
import { CAM0, Layer, MeadowSet } from "../toon/sets";
import { Label, SheetBg } from "./common";

/** The revised monkey presenter, as a stickman: model, poses and moods on one sheet. */
export const StickMonkeySheet: React.FC = () => {
  const f = useCurrentFrame();
  const tail = 6 * Math.sin(f * 0.1);
  const moods: Mood[] = ["neutral", "smile", "talk", "surprised", "cheeky", "worried", "sour", "pain", "laugh", "focused"];
  return (
    <SheetBg title="Monkey presenter — stickman version" sub="Brown monkey head · cream face and muzzle · ears · tuft · blue shirt · red tie · black trousers · thin black stick limbs · curling tail">
      <KeylineDefs />
      <Stickman d={M} x={250} y={700} scale={1.55} pose={WAVE} mood="happy" talk="open" turn={0.2} tail={tail} />
      <Label x={250} y={750} t="presenter" />
      {[
        { p: STAND, m: "neutral" as Mood, l: "front", t: 0 },
        { p: walk(f * 0.22 + 0.6), m: "talk" as Mood, l: "walk", t: 0.6 },
        { p: run(f * 0.38 + 1), m: "scared" as Mood, l: "run", t: 0.6 },
        { p: POINT, m: "cheeky" as Mood, l: "point", t: 0.6 },
        { p: HOLD_UP, m: "proud" as Mood, l: "hold up", t: 0.2, hold: true },
        { p: SHRUG, m: "confused" as Mood, l: "shrug", t: 0 },
        { p: CHEER, m: "excited" as Mood, l: "cheer", t: 0 },
        { p: THINK, m: "curious" as Mood, l: "think", t: 0.3 },
        { p: SIT, m: "smile" as Mood, l: "sit", t: 0.3, seat: 60 },
      ].map((o, i) => {
        const x = 590 + (i % 5) * 290;
        const y = i < 5 ? 520 : 900;
        return (
          <g key={i}>
            <Stickman d={M} x={x} y={y} scale={0.8} pose={o.p} mood={o.m} turn={o.t} look={[o.t * 1.5, 0]} seat={o.seat} tail={tail}
              hold={o.hold ? (h) => <Flint x={h.near[0]} y={h.near[1] - 20} s={1.1} /> : undefined} />
            <Label x={x} y={y + 44} t={o.l} />
          </g>
        );
      })}
      <text x={60} y={860} fontFamily="'Noto Sans','DejaVu Sans',sans-serif" fontWeight={700} fontSize={22} fill="#7a6a55">expressions: see the expressions sheet</text>
    </SheetBg>
  );
};

/** The sample scene, two beats. A: Ama picks, Tuk has just tasted a sour berry, the monkey eyes
 *  his own berry. B: a moment later the monkey has tried it; Tuk and Ama laugh at his face. */
const BerryScene: React.FC<{ beat: "a" | "b" }> = ({ beat }) => {
  const f = useCurrentFrame();
  const cam = { x: 20, y: 150, z: 1.5 };
  const a = beat === "a";
  return (
    <AbsoluteFill>
      <MeadowSet f={f} picked={3} cam={cam} mid={
        <g>
          <KeylineDefs />
          <Layer cam={cam} depth={1}>
            <g filter="url(#keyline)">
              <Basket x={700} y={968} s={0.75} berries={7} />
              <Stickman d={AMA_STICK} x={590} y={960}
                pose={a ? tweak(REACH, { ra: [92, -10], la: [30, 40], lean: 7, tilt: 8, ll: [-10, 0], rl: [14, 0] }) : tweak(STAND, { ra: [40, 100], la: [-20, 30], lean: -4, tilt: -10 })}
                face={-1} mood={a ? "happy" : "laugh"} look={a ? [-1, 0.3] : [-1, 0]} turn={-0.5} />
              <Stickman d={TUK_STICK} x={880} y={972}
                pose={a ? tweak(STAND, { ra: [12, -160], la: [-40, 30], tilt: -10 }) : tweak(STAND, { ra: [60, 100], la: [-60, -100], lean: -6, tilt: 12 })}
                mood={a ? "disgust" : "laugh"} turn={a ? -0.4 : 0.5} look={a ? [-1, 0] : [1, 0]}
                hold={a ? (h) => <Berry x={h.near[0]} y={h.near[1] + 4} r={8} /> : undefined} />
              <Stickman d={M} x={1130} y={968}
                pose={a ? tweak(STAND, { ra: [40, 110], la: [-14, 12], tilt: 8 }) : tweak(STAND, { ra: [30, 140], la: [-40, -30], lean: -8, tilt: -14 })}
                face={-1} mood={a ? "curious" : "disgust"} look={a ? [0.6, -0.9] : [0, 0]} turn={a ? 0.2 : 0} tail={a ? 6 * Math.sin(f * 0.1) : 2}
                hold={a ? (h) => <Berry x={h.near[0]} y={h.near[1] - 12} r={10} /> : undefined} />
            </g>
          </Layer>
        </g>
      } />
    </AbsoluteFill>
  );
};
export const StickSampleScene: React.FC = () => <BerryScene beat="a" />;
export const StickSampleSceneB: React.FC = () => <BerryScene beat="b" />;

/** The monkey's expression range, large enough to judge, plus the same face system on a person. */
export const StickFacesSheet: React.FC = () => {
  const moods: Mood[] = ["neutral", "happy", "excited", "laugh", "cheeky", "curious", "surprised", "shock", "scared", "confused", "worried", "sad", "angry", "disgust", "pain", "focused", "sleepy", "proud"];
  const cell = (d: typeof M, m: Mood, x: number, y: number, size: number, talk: "closed" | "open" = "closed") => (
    <g key={`${d.id}${m}${x}`}>
      <svg x={x - size / 2} y={y - size / 2} width={size} height={size} viewBox="-72 -352 144 144">
        <Stickman d={d} x={0} y={0} pose={STAND} mood={m} talk={talk} turn={0} look={m === "curious" || m === "cheeky" ? [0.7, -0.3] : [0, 0]} />
      </svg>
      <text x={x} y={y + size / 2 + 6} textAnchor="middle" fontFamily="'Noto Sans','DejaVu Sans',sans-serif" fontWeight={700} fontSize={20} fill="#7a6a55">{m}</text>
    </g>
  );
  return (
    <SheetBg title="Expressions — the monkey presenter" sub="Eyes change shape and direction · brows move · real mouth shapes · talking opens the mouth of any mood">
      {moods.map((m, i) => cell(M, m, 150 + (i % 6) * 300, 250 + Math.floor(i / 6) * 270, 200))}
    </SheetBg>
  );
};

/** The rest of the stick cast at true scale, for reference next to the scene. */
export const StickCastSheet: React.FC = () => (
  <SheetBg title="Stick cast — white stickmen, coloured clothing, same rig" sub="Ama · Tuk · Oru · Nana, next to the presenter">
    {[
      { d: M, x: 260, p: POINT, m: "cheeky" as Mood },
      { d: AMA_STICK, x: 600, p: tweak(STAND, { ra: [60, 40] }), m: "smile" as Mood },
      { d: TUK_STICK, x: 900, p: WAVE, m: "laugh" as Mood },
      { d: ORU_STICK, x: 1200, p: tweak(STAND, { ra: [70, 50], la: [-20, 20] }), m: "focused" as Mood },
      { d: NANA_STICK, x: 1560, p: STAND, m: "smile" as Mood, staff: true },
    ].map((c) => (
      <g key={c.d.id}>
        {c.staff && <Stick from={[c.x + 44, 520]} to={[c.x + 50, 820]} />}
        <Stickman d={c.d} x={c.x} y={820} pose={c.p} mood={c.m} scale={1.25} turn={0.2} />
        <Label x={c.x} y={880} t={c.d.id} />
      </g>
    ))}
  </SheetBg>
);
