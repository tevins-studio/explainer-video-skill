import React from "react";
import { useCurrentFrame } from "remotion";
import { Figure, Head } from "../toon/Figure";
import type { Expr } from "../toon/Figure";
import { MONKEY_GUIDE as M } from "../toon/cast";
import { CHEER, HOLD_UP, POINT, SHRUG, SIT, STAND, WAVE, run, walk } from "../toon/poses";
import { Flint } from "../toon/props";
import { Label, SheetBg } from "./common";

/** Sheet 1: the monkey presenter — model views and poses. */
export const MonkeyModel: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <SheetBg title="Monkey presenter — model sheet" sub="Brown monkey · cream face and muzzle · round ears · tuft · blue shirt · red tie · dark trousers · curling tail">
      <Figure d={M} x={300} y={900} pose={WAVE} expr="happy" scale={1.45} hands={["open", "wave"]} tail={6 * Math.sin(f * 0.1)} />
      <Label x={300} y={960} t="hero pose" />
      {[-0.8, 0, 0.8].map((t, i) => (
        <g key={i}>
          <Figure d={M} x={660 + i * 230} y={560} pose={STAND} turn={t} face={t < 0 ? -1 : 1} scale={0.82} look={[t, 0]} />
          <Label x={660 + i * 230} y={600} t={["three-quarter L", "front", "three-quarter R"][i]} />
        </g>
      ))}
      <g>
        <Figure d={M} x={1440} y={560} pose={walk(f * 0.22)} scale={0.82} expr="neutral" talk="open" />
        <Label x={1440} y={600} t="walk" />
        <Figure d={M} x={1700} y={560} pose={run(f * 0.38 + 1)} scale={0.82} expr="excited" hands={["fist", "fist"]} />
        <Label x={1700} y={600} t="run" />
      </g>
      {[
        { p: POINT, e: "cheeky" as Expr, h: ["open", "point"], l: "point" },
        { p: HOLD_UP, e: "proud" as Expr, h: ["open", "hold"], l: "hold up", hold: true },
        { p: SHRUG, e: "worried" as Expr, h: ["open", "open"], l: "shrug" },
        { p: CHEER, e: "excited" as Expr, h: ["fist", "fist"], l: "cheer" },
        { p: SIT, e: "sleepy" as Expr, h: ["open", "open"], l: "sit", seat: 70 },
      ].map((o, i) => (
        <g key={i}>
          <Figure d={M} x={660 + i * 250} y={1000} pose={o.p} expr={o.e} scale={0.74} seat={o.seat}
            hands={o.h as ["open", "open"]}
            hold={o.hold ? (h) => <Flint x={h.near[0]} y={h.near[1] - 26} r={0} s={1.3} /> : undefined} />
          <Label x={660 + i * 250} y={1040} t={o.l} />
        </g>
      ))}
    </SheetBg>
  );
};

/** Sheet 2: expressions and mouth shapes. */
export const MonkeyFaces: React.FC = () => {
  const exprs: Expr[] = ["neutral", "happy", "excited", "surprised", "cheeky", "worried", "sour", "pain", "scared", "laugh", "focused", "sleepy"];
  return (
    <SheetBg title="Monkey presenter — expressions" sub="Brows, lids, pupils and mouth are separate controls; talking opens the mouth of any expression">
      {exprs.map((e, i) => (
        <g key={e} transform={`translate(${230 + (i % 6) * 292} ${330 + Math.floor(i / 6) * 330})`}>
          <Head d={M} expr={e} talk="closed" look={[0.15, 0]} blink={false} turn={(i % 3) * 0.2 - 0.1} />
          <Label x={0} y={140} t={e} />
        </g>
      ))}
      {(["closed", "open", "wide"] as const).map((t, i) => (
        <g key={t} transform={`translate(${1530 + i * 0} ${0})`} />
      ))}
    </SheetBg>
  );
};
