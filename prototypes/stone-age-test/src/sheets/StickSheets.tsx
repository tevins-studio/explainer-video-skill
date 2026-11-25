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
    <SheetBg title="Monkey presenter — stickman version" sub="Brown round head · cream face and muzzle · ears · tuft · blue shirt · red tie · dark trousers · thin stick limbs · curling tail">
      <KeylineDefs />
      <Stickman d={M} x={250} y={700} scale={1.55} pose={WAVE} mood="smile" turn={0.2} tail={tail} />
      <Label x={250} y={750} t="presenter" />
      {[
        { p: STAND, m: "neutral" as Mood, l: "front", t: 0 },
        { p: walk(f * 0.22 + 0.6), m: "talk" as Mood, l: "walk", t: 0.6 },
        { p: run(f * 0.38 + 1), m: "surprised" as Mood, l: "run", t: 0.6 },
        { p: POINT, m: "cheeky" as Mood, l: "point", t: 0.6 },
        { p: HOLD_UP, m: "proud" as Mood, l: "hold up", t: 0.2, hold: true },
        { p: SHRUG, m: "worried" as Mood, l: "shrug", t: 0 },
        { p: CHEER, m: "laugh" as Mood, l: "cheer", t: 0 },
        { p: THINK, m: "focused" as Mood, l: "think", t: 0.3 },
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
      <text x={60} y={840} fontFamily="'Noto Sans','DejaVu Sans',sans-serif" fontWeight={700} fontSize={22} fill="#7a6a55">small, understated faces</text>
      {moods.map((m, i) => (
        <g key={m}>
          <svg x={56 + (i % 5) * 84} y={858 + Math.floor(i / 5) * 104} width={84} height={84} viewBox="-60 -330 120 120">
            <Stickman d={M} x={0} y={0} pose={STAND} mood={m} talk={m === "talk" ? "open" : "closed"} turn={0} />
          </svg>
          <text x={98 + (i % 5) * 84} y={952 + Math.floor(i / 5) * 104} textAnchor="middle" fontFamily="'Noto Sans','DejaVu Sans',sans-serif" fontSize={14} fill="#7a6a55">{m}</text>
        </g>
      ))}
    </SheetBg>
  );
};

/** The sample scene: gathering berries. Ama picks, Tuk tastes a sour one, the monkey tries one. */
export const StickSampleScene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = { x: 20, y: 150, z: 1.5 };
  return (
    <AbsoluteFill>
      <MeadowSet f={f} picked={3} cam={cam} mid={
        <g>
          <KeylineDefs />
          <Layer cam={cam} depth={1}>
            <g filter="url(#keyline)">
              <Basket x={700} y={968} s={0.75} berries={7} />
              <Stickman d={AMA_STICK} x={590} y={960} pose={tweak(REACH, { ra: [92, -10], la: [30, 40], lean: 7, tilt: 8, ll: [-10, 0], rl: [14, 0] })} face={-1} mood="smile" look={[-1, 0.3]} turn={-0.5} />
              <Stickman d={TUK_STICK} x={880} y={972} pose={tweak(STAND, { ra: [12, -160], la: [-40, 30], tilt: -10 })} mood="sour" turn={-0.4} look={[-1, 0]}
                hold={(h) => <Berry x={h.near[0]} y={h.near[1] + 4} r={8} />} />
              <Stickman d={M} x={1130} y={968} pose={tweak(STAND, { ra: [40, 110], la: [-14, 12], tilt: 8 })} face={-1} mood="cheeky" look={[0.2, -0.8]} turn={0.1} tail={6 * Math.sin(f * 0.1)}
                hold={(h) => <Berry x={h.near[0]} y={h.near[1] - 12} r={10} />} />
            </g>
          </Layer>
        </g>
      } />
    </AbsoluteFill>
  );
};

/** The rest of the stick cast at true scale, for reference next to the scene. */
export const StickCastSheet: React.FC = () => (
  <SheetBg title="Stick cast — same rig, colour only on clothing and key details" sub="Ama · Tuk · Oru · Nana, next to the presenter">
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
