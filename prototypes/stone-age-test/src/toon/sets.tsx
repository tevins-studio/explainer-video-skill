import React from "react";
import { HIDE, INK, MUSEUM, NATURE, NIGHT, WHITE, ACCENT } from "./palette";
import {
  BerryBush, Bird, Campfire, Cloud, Fern, Flower, Hill, LeafTree, Mammoth, Pine, Range, Rock, Sky, Smoke, Stars, Sun, Tent, Tuft, rnd,
} from "./scenery";

/** The five sets of the test. Every set is a stack of depth layers; the camera moves the near
 *  layers more than the far ones (parallax). cam: x, y in px of the near plane, z = zoom. */
export type Cam = { x: number; y: number; z: number };
export const CAM0: Cam = { x: 0, y: 0, z: 1 };

/** depth 0 = fixed (sky), 1 = the plane the characters stand on, > 1 = foreground. */
export const Layer: React.FC<{ cam: Cam; depth: number; children: React.ReactNode; cx?: number; cy?: number }> = ({ cam, depth, children, cx = 960, cy = 600 }) => {
  const z = 1 + (cam.z - 1) * depth;
  return <g transform={`translate(${cx} ${cy}) scale(${z}) translate(${-cx - cam.x * depth} ${-cy - cam.y * depth})`}>{children}</g>;
};

const st = (w = 4.5) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });

// ------------------------------------------------------------------------------------------ 1
/** The presenter's set: a natural-history hall with a mammoth skeleton and a cave-art panel. */
export const MuseumSet: React.FC<{ f: number; cam?: Cam; front?: React.ReactNode; mid?: React.ReactNode }> = ({ f, cam = CAM0, front, mid }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="mwall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e9d9bb" /><stop offset="1" stopColor={MUSEUM.wall} />
      </linearGradient>
      <radialGradient id="spot" cx="0.5" cy="0.2" r="0.7">
        <stop offset="0" stopColor="#fff6dc" stopOpacity="0.75" /><stop offset="1" stopColor="#fff6dc" stopOpacity="0" />
      </radialGradient>
    </defs>
    <Layer cam={cam} depth={0.3}>
      <rect x={-1200} y={-800} width={4320} height={2600} fill="url(#mwall)" />
      {/* arches */}
      {[-260, 420, 1100, 1780].map((x) => (
        <g key={x}>
          <path d={`M ${x} 760 L ${x} 260 Q ${x + 170} 80 ${x + 340} 260 L ${x + 340} 760 Z`} fill={MUSEUM.wallShade} stroke="#cdb894" strokeWidth={5} />
          <path d={`M ${x + 30} 760 L ${x + 30} 280 Q ${x + 170} 130 ${x + 310} 280 L ${x + 310} 760`} fill="none" stroke="#d8c5a0" strokeWidth={4} />
        </g>
      ))}
      <rect x={-1200} y={720} width={4320} height={40} fill={MUSEUM.panel} stroke={INK} strokeWidth={4} />
      <rect x={-1200} y={760} width={4320} height={1200} fill={MUSEUM.floor} />
      {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M ${-400 + i * 180} 760 L ${-1400 + i * 300} 1300`} stroke={MUSEUM.floorShade} strokeWidth={4} />)}
    </Layer>
    <Layer cam={cam} depth={0.55}>
      <ellipse cx={1340} cy={460} rx={520} ry={420} fill="url(#spot)" />
      {/* a cave-art panel on an easel-frame */}
      <g transform="translate(330 250)">
        <rect x={0} y={0} width={360} height={240} rx={10} fill="#d9b98c" stroke={INK} strokeWidth={6} />
        <rect x={16} y={16} width={328} height={208} rx={6} fill="#e8cfa4" />
        <path d="M 60 160 q 30 -60 90 -50 q 40 -20 70 10 l 0 40 M 80 160 l 0 30 M 120 160 l 0 30 M 180 160 l 0 30 M 210 160 l 0 30 M 220 110 q 20 10 16 40" stroke="#8a3b22" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M 250 100 l 40 -30 M 260 120 l 46 -16 M 230 70 l 30 -36" stroke="#8a3b22" strokeWidth={6} strokeLinecap="round" />
        <circle cx={300} cy={190} r={14} fill="none" stroke="#8a3b22" strokeWidth={6} />
        <path d="M 160 -20 L 180 0 L 200 -20" stroke={INK} strokeWidth={4} fill="none" />
      </g>
      {/* mammoth skeleton on a plinth */}
      <g transform="translate(1340 690)">
        <rect x={-330} y={0} width={660} height={60} rx={8} fill={MUSEUM.panel} stroke={INK} strokeWidth={5} />
        <g stroke={INK} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" fill={MUSEUM.bone}>
          {[-180, -90, 110, 190].map((x, i) => (
            <path key={i} d={`M ${x - 12} -230 L ${x - 10} -10 L ${x + 12} -10 L ${x + 14} -230 Z`} />
          ))}
          <path d="M -230 -320 Q -40 -420 230 -300" fill="none" strokeWidth={22} stroke={INK} />
          <path d="M -230 -320 Q -40 -420 230 -300" fill="none" strokeWidth={13} stroke={MUSEUM.bone} />
          {Array.from({ length: 9 }, (_, i) => {
            const x = -170 + i * 44;
            const top = -350 - Math.sin((i / 8) * Math.PI) * 50 + 20;
            return <path key={`r${i}`} d={`M ${x} ${top} Q ${x + 30} ${top + 90} ${x + 6} ${-200}`} fill="none" strokeWidth={9} stroke={INK} />;
          })}
          {Array.from({ length: 9 }, (_, i) => {
            const x = -170 + i * 44;
            const top = -350 - Math.sin((i / 8) * Math.PI) * 50 + 20;
            return <path key={`b${i}`} d={`M ${x} ${top} Q ${x + 30} ${top + 90} ${x + 6} ${-200}`} fill="none" strokeWidth={4} stroke={MUSEUM.bone} />;
          })}
          <path d="M -230 -330 Q -330 -400 -350 -300 Q -356 -250 -320 -240 Q -280 -250 -250 -280 Z" />
          <circle cx={-310} cy={-320} r={12} fill={MUSEUM.boneShade} />
          <path d="M -320 -250 Q -420 -200 -410 -300 Q -400 -330 -380 -340 Q -392 -270 -340 -262 Z" fill={WHITE} />
        </g>
        <rect x={-120} y={14} width={240} height={30} rx={4} fill="#d9b98c" stroke={INK} strokeWidth={3} />
      </g>
    </Layer>
    {mid}
    <Layer cam={cam} depth={1.25}>
      {/* rope barrier in the foreground */}
      {[-60, 520, 1100, 1680].map((x) => (
        <g key={x}>
          <rect x={x - 10} y={830} width={20} height={300} fill="#c9a34a" stroke={INK} strokeWidth={4} />
          <circle cx={x} cy={822} r={18} fill="#e0bf63" stroke={INK} strokeWidth={4} />
        </g>
      ))}
      {[[-60, 520], [520, 1100], [1100, 1680]].map(([a, b], i) => (
        <g key={i}>
          <path d={`M ${a} 836 Q ${(a + b) / 2} ${920 + 6 * Math.sin(f * 0.05 + i)} ${b} 836`} stroke={INK} strokeWidth={22} fill="none" />
          <path d={`M ${a} 836 Q ${(a + b) / 2} ${920 + 6 * Math.sin(f * 0.05 + i)} ${b} 836`} stroke={MUSEUM.rope} strokeWidth={13} fill="none" />
        </g>
      ))}
    </Layer>
    {front}
  </svg>
);

// ------------------------------------------------------------------------------------------ 2
/** The Ice Age valley: a glacier, its meltwater river, a mammoth herd on the tundra. */
export const IceValleySet: React.FC<{ f: number; cam?: Cam; mid?: React.ReactNode; front?: React.ReactNode; herdX?: number }> = ({ f, cam = CAM0, mid, front, herdX = 0 }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <Layer cam={cam} depth={0}>
      <Sky id="iceSky" top="#79b4e3" bottom="#e7f2f6" h={700} />
      <Sun x={1560} y={170} r={64} />
    </Layer>
    <Layer cam={cam} depth={0.1}>
      <Cloud x={340 + f * 0.25} y={180} s={1.1} />
      <Cloud x={1080 + f * 0.18} y={110} s={0.8} />
    </Layer>
    <Layer cam={cam} depth={0.2}>
      <Range base={560} fill="#b3cde2" shade="#9ab9d3" peaks={[[-200, 260], [180, 200], [520, 290], [900, 170], [1260, 280], [1620, 210], [2000, 300]]} snowLine={110} />
    </Layer>
    <Layer cam={cam} depth={0.35}>
      <Range base={640} fill="#8fb0c9" shade="#7899b3" line="#6c8ea9" peaks={[[-300, 420], [80, 340], [420, 430], [1500, 380], [1900, 330], [2300, 420]]} snowLine={70} />
      {/* the glacier tongue between the mountains */}
      <path d="M 820 250 Q 880 240 940 262 Q 960 360 1010 430 Q 1120 520 1130 600 L 1140 640 L 600 640 L 610 600 Q 640 510 760 440 Q 810 360 820 250 Z" fill={NATURE.ice} stroke="#6aa4c4" strokeWidth={4} strokeLinejoin="round" />
      <path d="M 860 290 Q 850 400 760 500 M 900 280 Q 910 420 880 560 M 930 300 Q 980 430 1060 540" stroke="#8ec5df" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M 700 470 l 30 -6 M 960 470 l 26 10 M 820 520 l 30 0" stroke="#6aa4c4" strokeWidth={4} strokeLinecap="round" />
      <path d="M 600 640 L 616 588 L 660 604 L 700 566 L 746 600 L 800 570 L 850 606 L 900 574 L 954 610 L 1010 580 L 1066 612 L 1110 590 L 1140 640 Z" fill="#e8f6fc" stroke="#6aa4c4" strokeWidth={4} strokeLinejoin="round" />
      <path d="M 640 640 L 660 610 M 720 640 L 740 606 M 820 640 L 832 612 M 920 640 L 940 614 M 1020 640 L 1040 616" stroke="#a8d4ea" strokeWidth={4} strokeLinecap="round" />
    </Layer>
    <Layer cam={cam} depth={0.55}>
      {/* tundra plain */}
      <Hill d="M -1200 660 Q -400 600 300 650 Q 900 610 1500 650 Q 2200 610 3000 660 L 3000 1400 L -1200 1400 Z" fill="#b9c873" line="#8e9f52" w={4} />
      {/* river from the glacier snout */}
      <path d="M 820 642 Q 760 690 860 730 Q 980 780 840 850 Q 700 930 880 1200 L 1220 1200 Q 980 930 1100 850 Q 1240 770 1000 720 Q 900 690 960 642 Z" fill={NATURE.water} stroke="#3a7fb0" strokeWidth={4} strokeLinejoin="round" />
      {[0, 1, 2, 3].map((i) => {
        const t = ((f * 1.2 + i * 50) % 200) / 200;
        const y = 660 + t * 360;
        const x = 900 + 60 * Math.sin(t * 6);
        return <path key={i} d={`M ${x - 30} ${y} q 15 -8 30 0 t 30 0`} stroke={NATURE.waterLight} strokeWidth={5} fill="none" strokeLinecap="round" opacity={1 - t * 0.5} />;
      })}
      {[[300, 700], [1400, 690], [1650, 720], [60, 720]].map(([x, y], i) => <Pine key={i} x={x} y={y} s={0.42} far snow />)}
      <g transform={`translate(${herdX} 0)`}>
        <Mammoth x={1260} y={700} s={0.22} walk={f * 0.12} far />
        <Mammoth x={1350} y={706} s={0.26} walk={f * 0.12 + 1} far />
        <Mammoth x={1460} y={702} s={0.2} walk={f * 0.12 + 2} far />
      </g>
    </Layer>
    <Layer cam={cam} depth={0.8}>
      <Hill d="M -1200 800 Q -200 730 520 790 Q 700 820 760 1200 L -1200 1200 Z" fill={NATURE.grass} line="#6f8f3e" w={4} />
      <Hill d="M 1180 1200 Q 1240 820 1700 770 Q 2400 760 3000 800 L 3000 1200 Z" fill={NATURE.grass} line="#6f8f3e" w={4} />
      {[[-60, 830], [190, 800], [1500, 800], [1760, 790]].map(([x, y], i) => <Pine key={i} x={x} y={y} s={0.75} snow={i % 2 === 0} />)}
      <g transform={`translate(${herdX * 1.4} 0)`}>
        <Mammoth x={1580} y={860} s={0.5} walk={f * 0.12 + 0.5} trunk={10 * Math.sin(f * 0.05)} />
      </g>
    </Layer>
    <Layer cam={cam} depth={1.0}>
      {/* the snowbank the presenter stands on */}
      <path d="M -1200 880 Q -300 820 260 860 Q 560 880 640 1000 L 680 1400 L -1200 1400 Z" fill={NATURE.snow} {...st()} />
      <path d="M 260 860 Q 560 880 640 1000 L 680 1400 L 420 1400 Q 520 1060 260 860 Z" fill={NATURE.snowShade} />
      <path d="M -1200 880 Q -300 820 260 860 Q 560 880 640 1000 L 680 1400" fill="none" {...st()} />
    </Layer>
    {mid}
    <Layer cam={cam} depth={1.0}>
      <Rock x={1700} y={1000} s={1.2} />
      {[1500, 1580, 1880].map((x, i) => <Tuft key={i} x={x} y={1010 + (i % 2) * 20} s={1.2} />)}
    </Layer>
    {front}
  </svg>
);

// ------------------------------------------------------------------------------------------ 3
/** Woodland edge in summer: berry bushes, broadleaf trees, distant hills. */
export const MeadowSet: React.FC<{ f: number; cam?: Cam; mid?: React.ReactNode; front?: React.ReactNode; picked?: number }> = ({ f, cam = CAM0, mid, front, picked = 2 }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <Layer cam={cam} depth={0}>
      <Sky id="meadowSky" top="#7ebde8" bottom="#eaf5f0" h={720} />
    </Layer>
    <Layer cam={cam} depth={0.1}>
      <Cloud x={260 + f * 0.3} y={150} s={1} />
      <Cloud x={1300 + f * 0.2} y={210} s={1.25} />
      {[0, 1, 2].map((i) => <Bird key={i} x={600 + i * 46 + f * 1.6} y={240 + i * 18} f={f} ph={i} s={0.8} />)}
    </Layer>
    <Layer cam={cam} depth={0.25}>
      <Hill d="M -1200 600 Q -400 470 300 560 Q 800 450 1300 540 Q 1800 470 3000 560 L 3000 1400 L -1200 1400 Z" fill="#a9cba0" line="#8fb489" w={4} />
    </Layer>
    <Layer cam={cam} depth={0.45}>
      <Hill d="M -1200 660 Q -200 600 700 640 Q 1400 600 3000 650 L 3000 1400 L -1200 1400 Z" fill="#94bd6a" line="#6f9a4b" w={4} />
      {[[80, 680, 0.55], [260, 670, 0.65], [1400, 660, 0.6], [1600, 670, 0.7], [1820, 680, 0.55], [-120, 690, 0.6]].map(([x, y, s], i) => (
        <LeafTree key={i} x={x} y={y} s={s} tone={i % 2} sway={1.2 * Math.sin(f * 0.04 + i)} />
      ))}
    </Layer>
    <Layer cam={cam} depth={0.75}>
      <Hill d="M -1200 760 Q 400 720 1100 760 Q 1700 740 3000 770 L 3000 1400 L -1200 1400 Z" fill={NATURE.grass} line="#6f9a4b" w={4} />
      <BerryBush x={1560} y={800} s={0.8} picked={0} rustle={0} />
      {[[300, 780], [900, 790], [1200, 800], [1800, 790]].map(([x, y], i) => <Tuft key={i} x={x} y={y} />)}
    </Layer>
    <Layer cam={cam} depth={1}>
      <path d="M -1200 880 Q 600 850 1300 880 Q 2000 870 3000 880 L 3000 1400 L -1200 1400 Z" fill="#a9cd6b" stroke="#8fb85a" strokeWidth={4} />
      <BerryBush x={420} y={900} s={1.15} picked={picked} rustle={0} />
      {Array.from({ length: 14 }, (_, i) => <Flower key={i} x={-80 + rnd(i + 5) * 2100} y={930 + rnd(i + 30) * 120} c={i % 3 ? "#f4d35e" : "#f6f0ea"} s={0.9} />)}
      {[[700, 960], [1150, 980], [1650, 950]].map(([x, y], i) => <Tuft key={i} x={x} y={y} s={1.3} />)}
    </Layer>
    {mid}
    <Layer cam={cam} depth={1.5}>
      <Fern x={60} y={1120} s={1.6} sway={2 * Math.sin(f * 0.05)} />
      <Fern x={1880} y={1130} s={1.5} flip sway={2 * Math.sin(f * 0.05 + 1)} />
    </Layer>
    {front}
  </svg>
);

// ------------------------------------------------------------------------------------------ 4
/** The toolmaker's camp under a rock overhang: tent, smoke, an anvil stone, flint flakes. */
export const CampSet: React.FC<{ f: number; cam?: Cam; mid?: React.ReactNode; front?: React.ReactNode }> = ({ f, cam = CAM0, mid, front }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <Layer cam={cam} depth={0}>
      <Sky id="campSky" top="#86c0e6" bottom="#f3eee0" h={700} />
    </Layer>
    <Layer cam={cam} depth={0.2}>
      <Range base={720} fill="#b7c9d6" shade="#a2b6c6" snow={false} peaks={[[-200, 420], [300, 360], [800, 440], [1300, 380], [1800, 430], [2300, 400]]} />
    </Layer>
    <Layer cam={cam} depth={0.4}>
      {/* the rock overhang */}
      <path d="M 900 700 L 980 380 Q 1040 200 1300 160 Q 1700 120 2100 180 L 2400 180 L 2400 700 Z" fill="#c7a47c" {...st()} />
      <path d="M 1000 360 Q 1300 300 1700 330 Q 2000 340 2400 320 M 980 470 Q 1400 420 2400 440 M 950 580 Q 1500 540 2400 560" stroke="#a9845c" strokeWidth={6} fill="none" />
      <path d="M 1120 700 Q 1100 540 1240 470 Q 1500 400 1800 450 Q 2000 480 2400 470 L 2400 700 Z" fill="#7d5d3f" {...st()} />
      <Hill d="M -1200 680 Q -200 640 700 670 Q 1500 650 3000 680 L 3000 1400 L -1200 1400 Z" fill="#c2a66f" line="#9c8452" w={4} />
      <Pine x={120} y={690} s={0.6} far />
      <Pine x={300} y={700} s={0.7} far />
      <Smoke x={1380} y={640} f={f} s={0.9} />
      <Campfire x={1380} y={680} f={f} s={0.3} />
    </Layer>
    <Layer cam={cam} depth={0.7}>
      <Tent x={560} y={790} s={0.9} />
      {/* drying rack with a hide */}
      <path d="M 1640 800 L 1660 560 M 1860 800 L 1840 560 M 1640 590 L 1860 590" stroke={NATURE.bark} strokeWidth={12} strokeLinecap="round" />
      <path d="M 1640 800 L 1660 560 M 1860 800 L 1840 560 M 1640 590 L 1860 590" stroke={INK} strokeWidth={3} fill="none" />
      <path d="M 1680 592 Q 1750 640 1820 592 L 1830 700 Q 1750 740 1670 700 Z" fill={HIDE.ochre} {...st()} />
    </Layer>
    <Layer cam={cam} depth={1}>
      <path d="M -1200 840 Q 800 800 3000 840 L 3000 1400 L -1200 1400 Z" fill={NATURE.earth} {...st()} />
      {Array.from({ length: 22 }, (_, i) => (
        <ellipse key={i} cx={-100 + rnd(i) * 2100} cy={900 + rnd(i + 40) * 160} rx={8 + rnd(i + 2) * 10} ry={5 + rnd(i + 3) * 4} fill={NATURE.earthShade} />
      ))}
      {/* the anvil stone and flakes */}
      <g transform="translate(1000 1000)">
        <path d="M -150 0 Q -160 -60 -100 -78 Q 0 -96 110 -76 Q 160 -56 150 0 Z" fill="#8f8b84" {...st()} />
        <path d="M -150 0 Q -150 -20 -120 -28 Q 0 -34 130 -26 Q 150 -16 150 0 Z" fill="#76726b" />
        <path d="M -100 -60 q 40 -10 80 -4" stroke="#b5b1a9" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M -150 0 Q -160 -60 -100 -78 Q 0 -96 110 -76 Q 160 -56 150 0 Z" fill="none" {...st()} />
      </g>
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} transform={`translate(${860 + rnd(i + 11) * 320} ${1030 + rnd(i + 21) * 30}) rotate(${rnd(i) * 360}) scale(0.5)`}
          d="M -16 6 L -10 -10 L 6 -14 L 18 -2 L 10 12 Z" fill="#7d8792" stroke={INK} strokeWidth={4} />
      ))}
    </Layer>
    {mid}
    <Layer cam={cam} depth={1.4}>
      <Rock x={-40} y={1120} s={1.6} />
      <Fern x={1900} y={1140} s={1.3} flip sway={1.5 * Math.sin(f * 0.05)} />
    </Layer>
    {front}
  </svg>
);

// ------------------------------------------------------------------------------------------ 5
/** Night camp under the cliff. Light pool from the fire, stars, the moon, a rock wall for the
 *  shadow puppet. Characters in `mid` get the night grade through the "firelit" filter. */
export const NightSet: React.FC<{ f: number; cam?: Cam; mid?: React.ReactNode; front?: React.ReactNode; shadow?: React.ReactNode }> = ({ f, cam = CAM0, mid, front, shadow }) => {
  const flick = 1 + 0.025 * Math.sin(f * 0.6) + 0.015 * Math.sin(f * 1.7);
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="fireGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={NIGHT.glow} stopOpacity="0.85" />
          <stop offset="0.45" stopColor={NIGHT.fire2} stopOpacity="0.35" />
          <stop offset="1" stopColor={NIGHT.fire2} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vignette" cx="0.5" cy="0.62" r="0.75">
          <stop offset="0.45" stopColor="#0b0f22" stopOpacity="0" />
          <stop offset="1" stopColor="#0b0f22" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.3" stopColor="#fff3c4" stopOpacity="0.3" /><stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
        <filter id="firelit" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="1.0 0.06 0 0 0.04  0.04 0.74 0.04 0 0.0  0.02 0.06 0.56 0 0.03  0 0 0 1 0" />
        </filter>
        <filter id="silhouette" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.09  0 0 0 0 0.07  0 0 0 0.85 0" />
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <Layer cam={cam} depth={0}>
        <Sky id="nightSky" top={NIGHT.skyTop} bottom={NIGHT.skyBottom} h={760} />
        <Stars f={f} n={80} />
        <circle cx={1580} cy={160} r={140} fill="url(#moonGlow)" />
        <path d="M 1580 102 a 58 58 0 1 0 50 88 a 46 46 0 1 1 -50 -88 Z" fill="#fff3c4" stroke="#e8d79c" strokeWidth={3} />
      </Layer>
      <Layer cam={cam} depth={0.2}>
        <Range base={660} fill={NIGHT.far} shade="#262c52" line="#3e4677" peaks={[[-200, 470], [300, 400], [800, 480], [1300, 420], [1800, 470], [2300, 430]]} snowLine={50} />
      </Layer>
      <Layer cam={cam} depth={0.5}>
        <Hill d="M -1200 700 Q -200 660 700 690 Q 1500 670 3000 700 L 3000 1400 L -1200 1400 Z" fill={NIGHT.hill} line="#1b2240" w={4} />
        {[[160, 720], [340, 730], [1840, 720]].map(([x, y], i) => (
          <g key={i} filter="url(#firelit)" opacity={0.75}><Pine x={x} y={y} s={0.7} far /></g>
        ))}
      </Layer>
      <Layer cam={cam} depth={0.75}>
        {/* the cliff wall behind the group, lit by the fire */}
        <path d="M 1080 820 L 1120 520 Q 1180 330 1420 300 Q 1800 280 2300 320 L 2300 820 Z" fill="#6d5a52" {...st()} />
        <path d="M 1160 470 Q 1500 420 2300 440 M 1130 600 Q 1600 560 2300 580" stroke="#5a4943" strokeWidth={6} fill="none" />
        <ellipse cx={1500} cy={560} rx={420 * flick} ry={260 * flick} fill="url(#fireGlow)" opacity={0.65} />
        <g filter="url(#silhouette)">{shadow}</g>
      </Layer>
      <Layer cam={cam} depth={1}>
        <path d="M -1200 820 Q 600 790 3000 820 L 3000 1400 L -1200 1400 Z" fill={NIGHT.ground} {...st()} />
        <ellipse cx={960} cy={900} rx={760 * flick} ry={210 * flick} fill="url(#fireGlow)" />
        <path d="M 1300 880 L 1560 880" stroke={INK} strokeWidth={50} strokeLinecap="round" />
        <path d="M 1300 880 L 1560 880" stroke="#7a5232" strokeWidth={40} strokeLinecap="round" />
        <ellipse cx={1560} cy={880} rx={12} ry={20} fill="#c99a63" stroke={INK} strokeWidth={4} />
      </Layer>
      <g filter="url(#firelit)">{mid}</g>
      <Layer cam={cam} depth={1}>
        <Campfire x={960} y={900} f={f} s={1} />
        <ellipse cx={960} cy={760} rx={260 * flick} ry={240 * flick} fill="url(#fireGlow)" opacity={0.55} style={{ mixBlendMode: "screen" }} />
      </Layer>
      {front}
      <rect x={0} y={0} width={1920} height={1080} fill="url(#vignette)" />
    </svg>
  );
};

/** Colour helpers for the corner tag of a style frame. */
export const FrameTag: React.FC<{ n: number; t: string }> = ({ n, t }) => (
  <g>
    <rect x={40} y={36} width={60 + `${n} · ${t}`.length * 16.2} height={54} rx={27} fill="rgba(43,33,27,0.82)" />
    <text x={62} y={72} fontFamily="'Noto Sans','DejaVu Sans',sans-serif" fontWeight={800} fontSize={26} fill={WHITE}>{`${n} · ${t}`}</text>
    <circle cx={1880} cy={60} r={0} fill={ACCENT.red} />
  </g>
);
