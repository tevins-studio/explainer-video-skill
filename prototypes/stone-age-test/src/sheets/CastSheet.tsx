import React from "react";
import { useCurrentFrame } from "remotion";
import { Figure, Head } from "../toon/Figure";
import type { Expr } from "../toon/Figure";
import { CHILD, ELDER, GATHERER, HUNTER, MONKEY_GUIDE, TOOLMAKER } from "../toon/cast";
import { PRESENT, STAND, THINK, WAVE, HIPS, REACH } from "../toon/poses";
import { Basket, Hammerstone, Stick } from "../toon/props";
import { Label, SheetBg } from "./common";

/** Sheet 3: the recurring cast, side by side at true scale, with two expressions each. */
export const CastSheet: React.FC = () => {
  const f = useCurrentFrame();
  const row = 700;
  const cast = [
    { d: GATHERER, x: 470, pose: PRESENT, e: "happy" as Expr, name: "Ama — gatherer", ex: ["laugh", "surprised"] as Expr[],
      hold: undefined },
    { d: CHILD, x: 760, pose: WAVE, e: "excited" as Expr, name: "Tuk — child", ex: ["sour", "cheeky"] as Expr[], hands: ["open", "wave"] },
    { d: TOOLMAKER, x: 1050, pose: HIPS, e: "proud" as Expr, name: "Oru — toolmaker", ex: ["focused", "laugh"] as Expr[] },
    { d: ELDER, x: 1340, pose: STAND, e: "neutral" as Expr, name: "Nana — elder", ex: ["happy", "worried"] as Expr[], staff: true },
    { d: HUNTER, x: 1630, pose: THINK, e: "focused" as Expr, name: "Bek — hunter", ex: ["surprised", "happy"] as Expr[] },
  ];
  return (
    <SheetBg title="Supporting cast — sample designs" sub="Same rig, outline and palette as the presenter · each has one silhouette you can read at a glance">
      <Figure d={MONKEY_GUIDE} x={190} y={row} pose={tweakPoint()} expr="cheeky" hands={["open", "point"]} look={[1, 0]} tail={6 * Math.sin(f * 0.1)} />
      <Label x={190} y={row + 50} t="presenter (scale)" />
      {cast.map((c) => (
        <g key={c.name}>
          {c.staff && <Stick from={[c.x + 62, row - 300]} to={[c.x + 70, row]} />}
          <Figure d={c.d} x={c.x} y={row} pose={c.pose} expr={c.e} hands={(c.hands ?? (c.staff ? ["open", "hold"] : ["open", "open"])) as ["open", "open"]} />
          <Label x={c.x} y={row + 50} t={c.name} />
          {c.ex.map((e, i) => (
            <g key={e} transform={`translate(${c.x - 62 + i * 124} ${900}) scale(0.62)`}>
              <Head d={c.d} expr={e} talk="closed" look={[0.1, 0]} blink={false} turn={0.15} />
            </g>
          ))}
        </g>
      ))}
      <Basket x={540} y={row} s={0.62} berries={6} />
      <Hammerstone x={1120} y={row - 6} s={0.9} />
    </SheetBg>
  );
};
import { POINT } from "../toon/poses";
const tweakPoint = () => POINT;
