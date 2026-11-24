import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "../toon/Figure";
import { CHILD, ELDER, GATHERER, HUNTER, MONKEY_GUIDE as M, TOOLMAKER } from "../toon/cast";
import { CROUCH, KNEEL, POINT, PRESENT, REACH, SIT, SIT_GROUND, STAND, WAVE, tweak } from "../toon/poses";
import { Basket, Berry, Blade, Flint, Hammerstone, Stick } from "../toon/props";
import { CampSet, FrameTag, IceValleySet, Layer, CAM0, MeadowSet, MuseumSet, NightSet } from "../toon/sets";
import { Mammoth } from "../toon/scenery";

const Tag: React.FC<{ n: number; t: string }> = ({ n, t }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><FrameTag n={n} t={t} /></svg>
);

/** 1 — the presenter's close-up in the museum hall. */
export const Frame1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <MuseumSet f={f} cam={{ x: 0, y: 0, z: 1 }} front={
        <Layer cam={CAM0} depth={1.3}>
          <Figure d={M} x={720} y={1330} scale={2.2} pose={tweak(PRESENT, { ra: [70, 60], la: [-40, -50] })} expr="excited" talk="open" look={[0, 0.1]} turn={0.1} hands={["open", "open"]} tail={6 * Math.sin(f * 0.1)} />
        </Layer>
      } />
      <Tag n={1} t="Presenter close-up · museum hall" />
    </AbsoluteFill>
  );
};

/** 2 — Ice Age valley: the presenter on the snowbank points out the herd. */
export const Frame2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <IceValleySet f={f} mid={
        <Layer cam={CAM0} depth={1}>
          <Figure d={M} x={360} y={900} scale={0.95} pose={POINT} expr="excited" talk="open" look={[1, -0.2]} hands={["open", "point"]} tail={8 * Math.sin(f * 0.1)} />
        </Layer>
      } />
      <Tag n={2} t="Ice Age valley" />
    </AbsoluteFill>
  );
};

/** 3 — gathering berries: the child tastes a sour one, the presenter is next. */
export const Frame3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <MeadowSet f={f} picked={3} cam={{ x: -20, y: 150, z: 1.22 }} mid={
        <Layer cam={{ x: -20, y: 150, z: 1.22 }} depth={1}>
          <Basket x={720} y={960} s={0.9} berries={7} />
          <Figure d={GATHERER} x={600} y={950} pose={tweak(REACH, { ra: [80, 10] })} face={-1} expr="laugh" look={[1, 0]} hands={["open", "open"]} />
          <Figure d={CHILD} x={880} y={968} pose={tweak(STAND, { ra: [20, -168], la: [-30, 20], tilt: -8 })} expr="sour" hands={["open", "hold"]} turn={0}
            hold={(h) => <Berry x={h.near[0]} y={h.near[1] + 6} r={9} />} />
          <Figure d={M} x={1180} y={960} pose={tweak(STAND, { ra: [70, 70], tilt: 6 })} face={-1} expr="cheeky" look={[1, 0.2]} hands={["open", "hold"]} turn={0.4} tail={8 * Math.sin(f * 0.1)}
            hold={(h) => <Berry x={h.near[0]} y={h.near[1] - 20} r={12} />} />
        </Layer>
      } />
      <Tag n={3} t="Gathering berries" />
    </AbsoluteFill>
  );
};

/** 4 — toolmaking: the toolmaker strikes, the presenter watches with his own stone. */
export const Frame4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <CampSet f={f} mid={
        <Layer cam={CAM0} depth={1}>
          <Figure d={TOOLMAKER} x={1270} y={1000} scale={1.15} pose={tweak(SIT_GROUND, { ra: [150, -40], la: [70, 20], lean: 14 })} face={-1} expr="focused" look={[1, 0.6]} seat={40} hands={["hold", "hold"]}
            hold={(h) => <Hammerstone x={h.near[0]} y={h.near[1]} s={1.1} />} holdBehind={(h) => <Flint x={h.far[0]} y={h.far[1]} s={1.2} />} />
          <Flint x={1010} y={922} s={1.4} r={10} />
          <Figure d={M} x={740} y={1010} scale={1.1} pose={{ la: [30, 40], ra: [70, 30], ll: [70, -140], rl: [84, -150], lean: 12, tilt: 8 }} seat={56} expr="focused" look={[1, 0.5]} hands={["open", "hold"]} tail={8 * Math.sin(f * 0.1)}
            hold={(h) => <Hammerstone x={h.near[0]} y={h.near[1]} s={0.9} />} />
        </Layer>
      } />
      <Tag n={4} t="Making stone tools" />
    </AbsoluteFill>
  );
};

/** 5 — campfire: the elder tells a story with a shadow mammoth on the rock wall. */
export const Frame5: React.FC = () => {
  const f = useCurrentFrame();
  const wob = Math.sin(f * 0.1);
  return (
    <AbsoluteFill>
      <NightSet f={f}
        shadow={<g opacity={0.55}><g transform={`translate(${1480 + 10 * wob} 560) scale(0.55)`}><Mammoth x={0} y={0} s={1} walk={f * 0.1} far={false} /></g></g>}
        mid={
          <Layer cam={CAM0} depth={1}>
            <Figure d={ELDER} x={560} y={900} pose={tweak(SIT_GROUND, { ra: [128, 30], la: [-110, -30], tilt: 6 })} seat={36} expr="happy" talk="open" look={[1, -0.5]} hands={["open", "open"]} />
            <Figure d={CHILD} x={740} y={960} pose={SIT_GROUND} seat={24} expr="surprised" look={[1, -0.8]} />
            <Figure d={HUNTER} x={1110} y={850} scale={0.88} pose={SIT_GROUND} seat={34} face={-1} expr="happy" look={[1, 0]} />
            <Figure d={GATHERER} x={1250} y={960} pose={tweak(SIT_GROUND, { ra: [80, 10] })} seat={34} face={-1} expr="laugh" hands={["open", "hold"]}
              hold={(h) => <Stick from={[h.near[0], h.near[1]]} to={[h.near[0] + 170, h.near[1] - 70]} />} />
            <Figure d={M} x={1470} y={880} pose={SIT} seat={0} face={-1} expr="sleepy" look={[1, 0]} hands={["open", "open"]} tail={6 * Math.sin(f * 0.08)} />
          </Layer>
        } />
      <Tag n={5} t="Campfire · night" />
    </AbsoluteFill>
  );
};
