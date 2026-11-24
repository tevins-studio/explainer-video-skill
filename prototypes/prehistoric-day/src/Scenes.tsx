import React from "react";
import { spring } from "remotion";
import { FPS, clamp, easeInOut, isBlinking, sine } from "./motion";
import type { Mouth } from "./motion";
import {
  BLUE, BROWN, INK, KNEEL, Monkey, PAPER, Pose, RED, SIT, STAND, Stick, TAN, WHITE, mixPose, walk, withPose,
} from "./Stick";

/** The three scenes of the prototype, drawn as SVG in the channel's stick-figure style.
 *  Every scene gets its local frame, its length, the voice length, the guide's mouth state and
 *  the subtitle span starts: in-beat actions are keyed to the spans, not to literal frames. */
export type SceneProps = { f: number; len: number; global: number; mouth: Mouth; spans: number[] };

const line = { stroke: INK, strokeWidth: 6, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const thin = { stroke: INK, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ramp = (f: number, a: number, b: number) => easeInOut(clamp((f - a) / Math.max(1, b - a), 0, 1));
const pop = (f: number, at: number) => (f < at ? 0 : spring({ frame: f - at, fps: FPS, config: { damping: 11, stiffness: 130 } }));

/** Hand-drawn "line boil": the outlines wobble a little, re-drawn every 4 frames. */
const Boil: React.FC<{ id: string; f: number; children: React.ReactNode }> = ({ id, f, children }) => (
  <>
    <defs>
      <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={Math.floor(f / 4) % 6} />
        <feDisplacementMap in="SourceGraphic" scale={4.5} />
      </filter>
    </defs>
    <g filter={`url(#${id})`}>{children}</g>
  </>
);

/** Camera: world point (cx, cy) sits at the frame centre, zoomed by z. */
const Cam: React.FC<{ cx: number; cy: number; z: number; children: React.ReactNode }> = ({ cx, cy, z, children }) => (
  <g transform={`translate(960 560) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);

const Svg: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, background: bg }}>
    {children}
  </svg>
);

const Tuft: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path d={`M ${x - 12 * s} ${y} L ${x - 6 * s} ${y - 16 * s} M ${x} ${y} L ${x} ${y - 22 * s} M ${x + 12 * s} ${y} L ${x + 6 * s} ${y - 16 * s}`}
    {...line} strokeWidth={4} />
);

const Pine: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 0 L 0 -40" stroke={BROWN} strokeWidth={10} strokeLinecap="round" />
    <path d="M 0 0 L 0 -40" {...line} strokeWidth={3} />
    <path d="M -60 -30 L 0 -130 L 60 -30 Z M -48 -90 L 0 -175 L 48 -90 Z M -34 -145 L 0 -215 L 34 -145 Z" fill={WHITE} {...thin} />
  </g>
);

const Rock: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M -40 0 Q -38 -28 -10 -34 Q 22 -38 38 -14 Q 44 0 40 0 Z" fill={WHITE} {...thin} />
);

// ---------------------------------------------------------------------------------------------
// Scene 1 — the prehistoric landscape. The guide walks in, stops and waves.

const Mammoth: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => {
  const leg = (dx: number, ph: number) => {
    const a = 10 * Math.sin(f * 0.12 + ph);
    return <path d={`M ${dx} -40 L ${dx + Math.sin((a * Math.PI) / 180) * 42} 0`} stroke={INK} strokeWidth={13} strokeLinecap="round" />;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(-0.55 0.55)`}>
      {leg(-40, 0)}{leg(35, Math.PI)}
      <path d="M -75 -40 Q -90 -125 -10 -130 Q 40 -150 80 -110 Q 100 -60 75 -40 Z" fill={BROWN} {...thin} />
      {leg(-55, Math.PI)}{leg(50, 0)}
      <path d="M 78 -112 Q 120 -110 118 -70 Q 116 -30 104 -14" fill="none" stroke={BROWN} strokeWidth={16} strokeLinecap="round" />
      <path d="M 78 -112 Q 120 -110 118 -70 Q 116 -30 104 -14" {...line} strokeWidth={3} />
      <path d="M 100 -70 Q 140 -60 132 -100" fill="none" stroke={WHITE} strokeWidth={9} strokeLinecap="round" />
      <path d="M 100 -70 Q 140 -60 132 -100" {...line} strokeWidth={2.5} />
      <circle cx={92} cy={-102} r={4} fill={INK} />
    </g>
  );
};

const Bird: React.FC<{ x: number; y: number; f: number; ph: number }> = ({ x, y, f, ph }) => {
  const w = 10 * Math.sin(f * 0.35 + ph);
  return <path d={`M ${x - 18} ${y - w} Q ${x - 8} ${y - 8} ${x} ${y} Q ${x + 8} ${y - 8} ${x + 18} ${y - w}`} {...line} strokeWidth={4} />;
};

export const SceneLandscape: React.FC<SceneProps> = ({ f, len, global, mouth, spans }) => {
  const H = 690; // horizon
  const G = 930; // the guide's feet
  // the guide walks in from the left, settles, waves, then points at the valley on the 2nd sentence
  const STOP = 92;
  const wx = -140 + (980 + 140) * ramp(f, 0, STOP) ** 0.9;
  const walking = f < STOP;
  const wave: Pose = withPose(STAND, { ra: [165, 18 + 26 * Math.sin((f - STOP) * 0.35)], tilt: 6, lean: -2 });
  const point: Pose = withPose(STAND, { ra: [105, -8], la: [-14, 10], tilt: -4, lean: 3 });
  const at2 = spans[1] ?? len * 0.4;
  let pose = walk(f * 0.27);
  if (!walking) {
    const settled = mixPose(walk(STOP * 0.27), STAND, ramp(f, STOP, STOP + 6));
    pose = mixPose(settled, wave, pop(f, STOP + 4));
    pose = mixPose(pose, point, pop(f, at2));
  }
  const z = 1 + 0.12 * ramp(f, 40, len);
  const cx = 860 + 140 * ramp(f, 0, len);
  const cy = 600 + 80 * ramp(f, 40, len);
  const drip = (x0: number, y0: number, ph: number) => {
    const k = ((f + ph) % 36) / 36;
    return <path d={`M ${x0} ${y0 + k * 40} q -7 12 0 16 q 7 -4 0 -16`} fill={BLUE} {...thin} strokeWidth={2.5} opacity={1 - k * 0.6} />;
  };
  return (
    <Svg bg={PAPER}>
      <Boil id="boil1" f={global}>
        <Cam cx={cx} cy={cy} z={z}>
          <rect x={-800} y={-600} width={3600} height={H + 600} fill={PAPER} />
          {/* sun */}
          <g transform={`translate(330 210) rotate(${f * 0.4})`}>
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} transform={`rotate(${i * 45})`} d="M 0 -82 L 0 -104" {...line} strokeWidth={5} />
            ))}
          </g>
          <circle cx={330} cy={210} r={62} fill={WHITE} {...thin} strokeWidth={5} />
          {/* mountains with melting snow caps */}
          <path d={`M -400 ${H} L 120 330 L 420 520 L 760 270 L 1120 560 L 1450 300 L 1900 ${H} Z`} fill="#ebdfc4" {...thin} strokeWidth={5} />
          <path d="M 70 370 L 120 330 L 172 368 L 140 360 L 120 378 L 98 362 Z" fill={WHITE} {...thin} />
          <path d="M 690 322 L 760 270 L 832 328 L 796 318 L 770 340 L 742 318 Z" fill={WHITE} {...thin} />
          <path d="M 1384 352 L 1450 300 L 1520 350 L 1484 342 L 1458 362 L 1430 340 Z" fill={WHITE} {...thin} />
          <path d={`M 1700 ${H} L 2050 380 L 2500 ${H} Z`} fill="#ebdfc4" {...thin} strokeWidth={5} />
          {/* glacier edge, dripping into a blue river */}
          <path d={`M 1560 ${H - 6} L 1600 600 L 1690 585 L 1770 612 L 1820 ${H - 6} Z`} fill={WHITE} {...thin} />
          {drip(1640, 618, 0)}{drip(1720, 622, 14)}{drip(1790, 640, 25)}
          <rect x={-800} y={H} width={3600} height={1200} fill={PAPER} />
          <path d={`M -800 ${H} L 2800 ${H}`} {...line} strokeWidth={5} />
          <path d={`M 1690 ${H + 2} C 1500 760, 1900 820, 1600 900 S 1500 1060, 1800 1200`} fill="none" stroke={BLUE} strokeWidth={34} strokeLinecap="round" />
          <path d={`M 1690 ${H + 2} C 1500 760, 1900 820, 1600 900 S 1500 1060, 1800 1200`} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="30 26" strokeDashoffset={-f * 2} opacity={0.5} />
          {/* hills and trees */}
          <path d={`M -400 ${H} Q 100 610 500 ${H}`} fill={WHITE} {...thin} />
          <path d={`M 900 ${H} Q 1250 625 1500 ${H}`} fill={WHITE} {...thin} />
          <Pine x={80} y={H + 30} s={0.8} />
          <Pine x={200} y={H + 50} s={1} />
          <Pine x={1460} y={H + 20} s={0.7} />
          <Pine x={2080} y={H + 60} s={1.1} />
          <Mammoth x={1260 - f * 0.7} y={H + 8} f={f} />
          <Bird x={600 + f * 2.2} y={190 + 6 * Math.sin(f * 0.05)} f={f} ph={0} />
          <Bird x={660 + f * 2.2} y={225 + 6 * Math.sin(f * 0.05 + 1)} f={f} ph={1.5} />
          <Bird x={560 + f * 2.2} y={240} f={f} ph={3} />
          <Rock x={430} y={H + 160} s={1.2} />
          <Rock x={1330} y={H + 230} s={0.9} />
          {[[150, 780], [330, 960], [620, 840], [820, 1000], [1180, 800], [1240, 990], [1460, 850], [40, 1000], [960, 760]].map(([x, y], i) => (
            <Tuft key={i} x={x} y={y} />
          ))}
          <Monkey x={wx} ground={G} pose={pose} mouth={mouth} blink={isBlinking(global)} tailSway={8 * sine(global, 1.7)} />
        </Cam>
      </Boil>
    </Svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Scene 2 — everyday survival: berries and roots, and a flint knapper. The guide copies the strike.

const Basket: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={-30 + ((i * 17) % 60)} cy={-58 - Math.floor(i / 4) * 6} r={9} fill={RED} {...thin} strokeWidth={2.5} />
    ))}
    <path d="M -48 -60 L 48 -60 L 36 0 L -36 0 Z" fill={TAN} {...thin} />
    <path d="M -42 -40 L 42 -40 M -38 -20 L 38 -20 M -20 -60 L -16 0 M 0 -60 L 0 0 M 20 -60 L 16 0" {...line} strokeWidth={2.5} />
  </g>
);

const Bush: React.FC<{ x: number; y: number; picked: number }> = ({ x, y, picked }) => {
  const berries = [[-60, -90], [-20, -130], [30, -110], [70, -70], [-80, -40], [10, -60], [-30, -40], [50, -140], [80, -110], [-50, -150]];
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M -110 0 Q -140 -60 -90 -90 Q -100 -160 -30 -165 Q 10 -210 60 -170 Q 130 -170 110 -100 Q 150 -60 110 0 Z" fill={WHITE} {...thin} strokeWidth={5} />
      {berries.slice(picked).map(([bx, by], i) => <circle key={i} cx={bx} cy={by} r={10} fill={RED} {...thin} strokeWidth={2.5} />)}
    </g>
  );
};

const Hut: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -150 0 L 0 -230 L 150 0 Z" fill={TAN} {...thin} strokeWidth={5} />
    <path d="M -40 0 L 0 -80 L 40 0 Z" fill={INK} />
    <path d="M -30 -270 L 0 -230 L 30 -270 M -20 -280 L 0 -230 L 14 -290" {...line} strokeWidth={6} stroke={BROWN} />
    <path d="M -100 -60 L -60 -70 M 80 -50 L 110 -40 M -60 -130 L -30 -140" {...line} strokeWidth={3} />
  </g>
);

const Flint: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <path transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} d="M -16 6 L -10 -10 L 6 -14 L 18 -2 L 10 12 L -6 14 Z" fill={WHITE} {...thin} strokeWidth={3.5} />
);

const Blade: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <path transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} d="M 0 -42 L 12 -8 L 8 14 L -8 14 L -12 -8 Z M -4 0 L 0 -30" fill={WHITE} {...thin} strokeWidth={3.5} />
);

/** One knapping strike every PERIOD frames, the impact at HIT. */
export const PERIOD = 30;
const HIT = 20;
const strikeAngle = (f: number) => {
  const p = ((f % PERIOD) + PERIOD) % PERIOD;
  if (p < HIT - 6) return 60 + 80 * easeInOut(p / (HIT - 6)); // lift (anticipation)
  if (p < HIT) return 140 - 95 * ((p - (HIT - 6)) / 6); // fast strike
  return 45 + 15 * ((p - HIT) / (PERIOD - HIT)); // recoil and settle
};
/** Frames of the knapper's impacts inside the scene (for the knock sound). */
export const knapHits = (len: number, from: number) => {
  const out: number[] = [];
  for (let s = from; s < len; s += PERIOD) out.push(s + HIT);
  return out.filter((h) => h < len - 4);
};
export const BERRY_PERIOD = 46;
export const KNAP_FROM = 24;

export const SceneSurvival: React.FC<SceneProps> = ({ f, len, global, mouth, spans }) => {
  const H = 640;
  const G = 930;
  const at2 = spans[1] ?? len * 0.45;

  // the gatherer: reach into the bush, bring a berry back to the basket
  const cyc = (f % BERRY_PERIOD) / BERRY_PERIOD;
  const reachT = cyc < 0.45 ? easeInOut(cyc / 0.45) : 1 - easeInOut((cyc - 0.45) / 0.55);
  const picked = Math.min(9, Math.floor(f / BERRY_PERIOD) + (cyc > 0.45 ? 1 : 0));
  const inBasket = 3 + Math.floor(f / BERRY_PERIOD);
  const gatherer = mixPose(
    withPose(STAND, { ra: [30, 30], la: [20, 30], lean: 10, tilt: 10 }),
    withPose(STAND, { ra: [95, -10], la: [60, 20], lean: 22, tilt: -4, rl: [14, 0] }),
    reachT,
  );

  // the knapper kneels and strikes, the flakes fly
  const strike = strikeAngle(f - KNAP_FROM);
  const knapper = withPose(KNEEL, { ra: [strike, -20], la: [55, 25], lean: 18 + (strike < 60 ? 4 : 0) });
  const sinceHit = (((f - KNAP_FROM - HIT) % PERIOD) + PERIOD) % PERIOD;
  const flakes = f >= KNAP_FROM + HIT
    ? [[-1.6, -6], [1.2, -8], [2.4, -4]].map(([vx, vy], i) => {
        const t = sinceHit;
        return <Flint key={i} x={1255 + vx * t * 2.4} y={872 + vy * t + 0.35 * t * t} r={t * 20 + i * 50} s={0.45} />;
      })
    : null;

  // the guide: points at the gatherer, then turns and copies the strike, then shows the blade
  const showBlade = spans[2] ?? at2 + (len - at2) * 0.62;
  const turn = ramp(f, at2 - 4, at2 + 6);
  const gPoint = withPose(STAND, { ra: [100, -6], la: [-10, 12], lean: 4, tilt: -6 });
  const gStrike = withPose(STAND, { ra: [strikeAngle(f - KNAP_FROM), -30], la: [40, 50], lean: 8, tilt: 8 });
  const gShow = withPose(STAND, { ra: [170, 4], la: [-20, 14], lean: -3, tilt: -10 });
  let gPose = mixPose(STAND, gPoint, pop(f, 8));
  gPose = mixPose(gPose, gStrike, turn);
  const showK = pop(f, showBlade);
  gPose = mixPose(gPose, gShow, clamp(showK, 0, 1.08));
  const gFace: 1 | -1 = turn < 0.5 ? -1 : 1;

  const z = 1.08 + 0.1 * ramp(f, at2, len);
  const cx = 720 + 380 * ramp(f, at2 - 6, at2 + 30);
  return (
    <Svg bg={PAPER}>
      <Boil id="boil2" f={global}>
        <Cam cx={cx} cy={670} z={z}>
          <rect x={-800} y={-600} width={3600} height={1800} fill={PAPER} />
          <path d="M 1400 120 q 30 -40 70 -10 q 40 -30 70 10 q 30 0 20 30 l -170 0 q -20 -20 10 -30 Z" fill={WHITE} {...thin} transform={`translate(${-f * 0.6} 0)`} />
          <path d="M 300 160 q 30 -40 70 -10 q 40 -30 70 10 q 30 0 20 30 l -170 0 q -20 -20 10 -30 Z" fill={WHITE} {...thin} transform={`translate(${-f * 0.4} 0)`} />
          <path d={`M -800 ${H} Q 400 590 900 ${H} Q 1500 600 2800 ${H}`} fill="#ebdfc4" {...thin} strokeWidth={5} />
          <rect x={-800} y={H + 1} width={3600} height={1200} fill={PAPER} />
          <path d={`M -800 ${H} L 2800 ${H}`} {...line} strokeWidth={5} />
          <Pine x={60} y={H + 40} s={1.1} />
          <Pine x={1800} y={H + 30} s={1.2} />
          <Hut x={1020} y={H + 70} />
          {[[200, 720], [520, 1000], [760, 760], [1440, 980], [1640, 760], [300, 960]].map(([x, y], i) => <Tuft key={i} x={x} y={y} />)}

          {/* gathering */}
          <Bush x={250} y={G} picked={picked} />
          <Basket x={560} y={G} n={inBasket} />
          <path d="M 640 925 q 20 -30 50 -10 M 650 930 q 30 -10 60 -30 M 660 932 q 10 -20 40 -36" fill="none" stroke={TAN} strokeWidth={8} strokeLinecap="round" />
          <path d="M 640 925 q 20 -30 50 -10 M 650 930 q 30 -10 60 -30 M 660 932 q 10 -20 40 -36" {...line} strokeWidth={2} />
          <Stick x={470} ground={G} face={-1} pose={gatherer} hair="long" tunic blink={isBlinking(global + 40)}
            hold={(h) => (cyc > 0.4 && cyc < 0.9 ? <circle cx={h.near[0]} cy={h.near[1]} r={10} fill={RED} {...thin} strokeWidth={2.5} /> : null)} />

          {/* knapping */}
          <Rock x={1250} y={G - 6} s={1.3} />
          <Flint x={1250} y={868} s={1.6} />
          {flakes}
          <Stick x={1390} ground={G} face={-1} pose={knapper} seat={56} hair="tuft" tunic blink={isBlinking(global + 70)}
            hold={(h) => <Flint x={h.near[0]} y={h.near[1]} s={1.1} r={h.nearAng} />} />

          {/* the guide */}
          <Monkey x={880} ground={G} face={gFace} pose={gPose} mouth={mouth} blink={isBlinking(global)} tailSway={8 * sine(global, 1.7)}
            hold={(h) => turn > 0.5
              ? (showK > 0.05 ? <Blade x={h.near[0]} y={h.near[1] - 18} s={1.2} r={h.nearAng - 180} /> : <Flint x={h.near[0]} y={h.near[1]} s={1} r={h.nearAng} />)
              : null} />
          {showK > 0.05 && (
            <g opacity={clamp(showK, 0, 1)} transform={`translate(${880 + 30} ${G - 470})`}>
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <path key={a} transform={`rotate(${a + f * 2})`} d={`M 0 -70 L 0 ${-86 - 6 * Math.sin(f * 0.4)}`} {...line} strokeWidth={4} />
              ))}
            </g>
          )}
        </Cam>
      </Boil>
    </Svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Scene 3 — around the fire at night. The light pool is the fire's light: it flickers.

export const FIRE: [number, number] = [960, 860];
const NIGHT = "#1d1a17";
const DUSK = "#2b2621";

const Fire: React.FC<{ f: number }> = ({ f }) => {
  const [x, y] = FIRE;
  const fl = (k: number, w: number, h: number, ph: number, fill: string) => {
    const a = 1 + 0.12 * Math.sin(f * 0.55 + ph) + 0.06 * Math.sin(f * 1.3 + ph * 2);
    const lean = 10 * Math.sin(f * 0.3 + ph);
    return (
      <path d={`M ${-w} 0 Q ${-w * 1.1} ${-h * 0.5 * a} ${lean} ${-h * a} Q ${w * 1.1} ${-h * 0.5 * a} ${w} 0 Z`}
        transform={`translate(${k} 0)`} fill={fill} {...thin} strokeWidth={4} />
    );
  };
  const sparks = Array.from({ length: 7 }, (_, i) => {
    const t = ((f * 1.6 + i * 23) % 90) / 90;
    return <circle key={i} cx={x + 50 * Math.sin(i * 2.1 + t * 5)} cy={y - 60 - t * 300} r={5 * (1 - t) + 1} fill={TAN} opacity={1 - t} />;
  });
  return (
    <g>
      {sparks}
      <g transform={`translate(${x} ${y})`}>
        {[-90, -50, 0, 50, 90].map((dx, i) => <ellipse key={i} cx={dx} cy={10 - Math.abs(dx) * 0.05} rx={24} ry={14} fill={WHITE} {...thin} />)}
        {fl(0, 62, 150, 0, RED)}
        {fl(-26, 34, 95, 1.7, RED)}
        {fl(24, 36, 105, 3.1, RED)}
        {fl(0, 36, 100, 0.9, TAN)}
        {fl(0, 16, 52, 2.4, WHITE)}
        <path d="M -80 6 L 80 -18" stroke={BROWN} strokeWidth={22} strokeLinecap="round" />
        <path d="M -80 -18 L 80 6" stroke={BROWN} strokeWidth={22} strokeLinecap="round" />
        <path d="M -80 6 L 80 -18 M -80 -18 L 80 6" {...line} strokeWidth={3} />
      </g>
    </g>
  );
};

export const SceneFire: React.FC<SceneProps> = ({ f, len, global, mouth, spans }) => {
  const G = 900;
  const flick = 1 + 0.015 * Math.sin(f * 0.6) + 0.01 * Math.sin(f * 1.7);
  const at2 = spans[1] ?? len * 0.5;
  // storyteller: big gestures in turns
  const tell = withPose(SIT, {
    la: [95 + 25 * Math.sin(f * 0.13), -30 + 20 * Math.sin(f * 0.2)],
    ra: [120 + 30 * Math.sin(f * 0.13 + 1.4), -20 + 25 * Math.sin(f * 0.17)],
    lean: 6 + 4 * Math.sin(f * 0.1), tilt: 6 * Math.sin(f * 0.13),
  });
  const child = withPose(SIT, { lean: 18 + 3 * Math.sin(f * 0.08), tilt: -8, ra: [70, 40], la: [60, 50] });
  const roaster = withPose(SIT, { ra: [88 + 4 * Math.sin(f * 0.15), 0], la: [40, 40], lean: 10 });
  const elder = withPose(SIT, { tilt: 10 * Math.max(0, Math.sin(f * 0.12)), ra: [35, 50], la: [25, 60] });
  // the guide: points at the fire, then opens his arms on "share stories"
  const gPoint = withPose(SIT, { ra: [96, -4], la: [30, 40], lean: 8, tilt: -6 });
  const gOpen = withPose(SIT, { ra: [130 + 10 * Math.sin(f * 0.2), -20], la: [120, -20], lean: 2, tilt: 8 * Math.sin(f * 0.15) });
  const gPose = mixPose(mixPose(SIT, gPoint, pop(f, 10)), gOpen, pop(f, at2));

  const z = 1.0 + 0.14 * ramp(f, 0, len);
  const stars = [[120, 120], [380, 70], [610, 180], [820, 90], [1100, 150], [1290, 60], [1760, 110], [1860, 260], [240, 300], [700, 330], [1180, 300], [-80, 200], [2000, 150]];
  return (
    <Svg bg={NIGHT}>
      <Boil id="boil3" f={global}>
        <Cam cx={960 + 20 * ramp(f, 0, len)} cy={650 + 60 * ramp(f, 0, len)} z={z}>
          <rect x={-800} y={-600} width={3600} height={1800} fill={NIGHT} />
          {stars.map(([x, y], i) => {
            const s = 0.7 + 0.5 * Math.abs(Math.sin(f * 0.08 + i));
            return <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M 0 -12 L 3 -3 L 12 0 L 3 3 L 0 12 L -3 3 L -12 0 L -3 -3 Z" fill={PAPER} />;
          })}
          <path d="M 1600 130 a 70 70 0 1 0 60 110 a 56 56 0 1 1 -60 -110 Z" fill={PAPER} />
          <path d={`M -800 640 Q -100 520 500 620 Q 1100 540 1500 610 Q 2000 560 2800 640 L 2800 1400 L -800 1400 Z`} fill={DUSK} stroke={PAPER} strokeWidth={4} />
          {/* the fire's light */}
          <ellipse cx={FIRE[0]} cy={FIRE[1]} rx={900 * flick} ry={250 * flick} fill={PAPER} opacity={0.18} />
          <ellipse cx={FIRE[0]} cy={FIRE[1] + 10} rx={760 * flick} ry={200 * flick} fill={PAPER} stroke={INK} strokeWidth={5} />

          {/* behind the fire */}
          <Stick x={1080} ground={790} scale={0.85} pose={elder} seat={38} hair="tuft" face={-1} blink={isBlinking(global + 30)} />
          <Fire f={f} />
          {/* in front */}
          <Stick x={600} ground={G} pose={tell} seat={40} hair="long" tunic blink={isBlinking(global + 90)} />
          <Stick x={760} ground={G + 40} scale={0.7} pose={child} seat={34} hair="tuft" blink={isBlinking(global + 20)} />
          <path d="M 1280 900 Q 1280 860 1330 856 Q 1380 860 1380 900 Z" fill={WHITE} {...thin} />
          <Stick x={1320} ground={G} pose={roaster} seat={44} face={-1} tunic hair="bun" blink={isBlinking(global + 55)}
            hold={(h) => {
              const a = h.nearAng;
              const ex = h.near[0] + Math.sin((a * Math.PI) / 180) * 210;
              const ey = h.near[1] + Math.cos((a * Math.PI) / 180) * 210;
              return (
                <g>
                  <path d={`M ${h.near[0]} ${h.near[1]} L ${ex} ${ey}`} stroke={BROWN} strokeWidth={9} strokeLinecap="round" />
                  <path d={`M ${h.near[0]} ${h.near[1]} L ${ex} ${ey}`} {...line} strokeWidth={2} />
                  <ellipse cx={ex - 8} cy={ey} rx={30} ry={18} fill={BROWN} {...thin} transform={`rotate(${-a + 90} ${ex - 8} ${ey})`} />
                </g>
              );
            }} />
          {/* the guide, on a log at the right */}
          <path d="M 1500 905 L 1720 905" stroke={BROWN} strokeWidth={40} strokeLinecap="round" />
          <path d="M 1500 885 L 1720 885 M 1500 925 L 1720 925" {...line} strokeWidth={4} />
          <ellipse cx={1720} cy={905} rx={12} ry={20} fill={TAN} {...thin} />
          <Monkey x={1610} ground={885} seat={0} face={-1} pose={gPose} mouth={mouth} blink={isBlinking(global)} tailSway={10 * sine(global, 1.9)} />
        </Cam>
      </Boil>
    </Svg>
  );
};
