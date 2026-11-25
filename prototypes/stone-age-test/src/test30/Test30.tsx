import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import rawStoryboard from "../../storyboard.json";
import envelopes from "../envelopes.json";
import cues from "../cues.json";
import { FPS, clamp, easeInOut, isBlinking, mouthStates } from "../motion";
import { KeylineDefs, Stickman } from "../stick/Stickman";
import type { Mood, Talk } from "../stick/Stickman";
import { AMA_STICK, MONKEY_STICK as M, NANA_STICK, ORU_STICK, TUK_STICK } from "../stick/stickCast";
import { CHEER, HOLD_UP, POINT, REACH, SCARED, SIT, SIT_GROUND, STAND, mix, tweak } from "../toon/poses";
import type { Pose } from "../toon/poses";
import { Basket, Berry, Blade, Flint, Hammerstone, Stick } from "../toon/props";
import { CampSet, IceValleySet, Layer, MeadowSet, MuseumSet, NightSet } from "../toon/sets";
import type { Cam } from "../toon/sets";
import { Mammoth } from "../toon/scenery";

/** The 30 s style test: five scenes, 900 frames. Each scene keys its actions and expressions to
 *  the phrase cues of its narration line (src/cues.json, written by scripts/tighten-pauses.py),
 *  so the faces and the action change on the words. */

type TBeat = { id: string; start: number; frames: number; line: string };
const sb = rawStoryboard as unknown as { beats: TBeat[] };
const beat = (id: string) => sb.beats.find((b) => b.id === id)!;
const CUES = cues as Record<string, number[]>;
export const TOTAL = 900;
export const SCENES = [
  { id: "s1", from: 0, len: 156 },
  { id: "s2", from: 156, len: 180 },
  { id: "s3", from: 336, len: 198 },
  { id: "s4", from: 534, len: 192 },
  { id: "s5", from: 726, len: 174 },
];
/** Phrase cues of a scene's line, as frames inside the scene. */
const cueOf = (id: string) => {
  const sc = SCENES.find((s) => s.id === id)!;
  const b = beat(id);
  const v = b.start - sc.from;
  return { v, end: v + b.frames, c: CUES[id].map((x) => v + x) };
};

const ramp = (f: number, a: number, b: number) => easeInOut(clamp((f - a) / Math.max(1, b - a), 0, 1));
const pop = (f: number, at: number, damping = 11) => (f < at ? 0 : spring({ frame: f - at, fps: FPS, config: { damping, stiffness: 150 } }));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const camAt = (f: number, keys: [number, Cam][]): Cam => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, c1] = keys[i];
    const [f0, c0] = keys[i - 1];
    if (f <= f1) {
      const k = easeInOut((f - f0) / (f1 - f0));
      return { x: lerp(c0.x, c1.x, k), y: lerp(c0.y, c1.y, k), z: lerp(c0.z, c1.z, k) };
    }
  }
  return keys[keys.length - 1][1];
};
const shake = (f: number, at: number, amp = 10, len = 12) => (f >= at && f < at + len ? amp * (1 - (f - at) / len) * Math.sin((f - at) * 2.6) : 0);

/** The narrator's mouth for a character who speaks the line on screen. */
const useTalk = () => React.useMemo(() => {
  const m: Record<string, ReturnType<typeof mouthStates>> = {};
  for (const [k, env] of Object.entries(envelopes as Record<string, number[]>)) m[k] = mouthStates(env.length ? env : [0]);
  return m;
}, []);
const talkAt = (states: Record<string, ReturnType<typeof mouthStates>>, id: string, g: number): Talk => {
  const b = beat(id);
  const i = g - b.start;
  const s = states[id];
  if (!s || i < 0 || i >= s.length) return "closed";
  return s[i] as Talk;
};

// ------------------------------------------------------------------------------------------ the vortex

const Vortex: React.FC<{ r: number; f: number; cx: number; cy: number; opacity?: number }> = ({ r, f, cx, cy, opacity = 1 }) => {
  if (r <= 1) return null;
  const cols = ["#3a2a7a", "#5b3fb0", "#2f8fbf", "#7bd3e0", "#b78cf0"];
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
      <defs>
        <radialGradient id="vtx" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff8e0" /><stop offset="0.25" stopColor="#b78cf0" /><stop offset="1" stopColor="#24184f" />
        </radialGradient>
        <clipPath id="vclip"><circle cx={cx} cy={cy} r={r} /></clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="url(#vtx)" />
      <g clipPath="url(#vclip)">
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} transform={`translate(${cx} ${cy}) rotate(${i * 36 + f * 9})`}
            d={`M 0 0 Q ${r * 0.5} ${-r * 0.25} ${r * 1.1} ${r * 0.05}`} stroke={cols[i % cols.length]} strokeWidth={Math.max(6, r * 0.08)} fill="none" strokeLinecap="round" opacity={0.85} />
        ))}
        {Array.from({ length: 14 }, (_, i) => {
          const a = i * 2.4 + f * 0.25;
          const rr = ((i * 37 + f * 6) % 100) / 100 * r;
          return <circle key={`s${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r={3 + (i % 3) * 2} fill="#fffaf0" />;
        })}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f1a17" strokeWidth={6} />
    </svg>
  );
};

// ------------------------------------------------------------------------------------------ 1 · presenter

const Scene1: React.FC<{ f: number; g: number; talk: Talk }> = ({ f, g, talk }) => {
  const { c, end } = cueOf("s1");
  const [hi, guide, travel] = c;
  const VTX = travel + 38; // the vortex opens behind him as he says "years"
  const rise = pop(f, 0, 13);
  const wave = tweak(STAND, { ra: [122, 48 + 26 * Math.sin(f * 0.45)], tilt: 6 });
  const chest = tweak(STAND, { ra: [24, -128], la: [-20, 20], tilt: -4, lean: 2 });
  const big = tweak(CHEER, { ra: [118, 40 + 10 * Math.sin(f * 0.3)], la: [-118, -40] });
  const lookBack = tweak(SCARED, { tilt: -10, lean: -8 });
  let pose: Pose = STAND;
  pose = mix(pose, wave, pop(f, hi));
  pose = mix(pose, chest, pop(f, guide));
  pose = mix(pose, big, pop(f, travel));
  pose = mix(pose, lookBack, pop(f, VTX + 6));
  let mood: Mood = "surprised";
  if (f >= hi) mood = "happy";
  if (f >= guide) mood = "proud";
  if (f >= travel) mood = "excited";
  if (f >= VTX + 4) mood = "shock";
  const speaking = f < end + 2;
  const vr = f < VTX ? 0 : interpolate(f, [VTX, VTX + 14, 156], [0, 260, 1500], { extrapolateRight: "clamp" });
  const suck = ramp(f, VTX + 12, 154);
  const cam = camAt(f, [[0, { x: 0, y: 0, z: 1 }], [VTX, { x: 30, y: 10, z: 1.08 }]]);
  const sx = shake(f, VTX, 9, 30);
  const title = interpolate(f, [guide - 6, guide + 8, travel + 20, travel + 34], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ transform: `translateX(${sx}px)` }}>
      <MuseumSet f={g} cam={cam} front={
        <g>
          <KeylineDefs />
          <Layer cam={cam} depth={1.3}>
            <g filter="url(#keyline)" transform={`translate(${suck * 420} ${(1 - rise) * 520 - suck * 360}) translate(760 820) rotate(${suck * 220}) scale(${1 - suck * 0.75}) translate(-760 -820)`}>
              <Stickman d={M} x={760} y={1430} scale={2.95} pose={pose} mood={mood} talk={speaking && mood !== "shock" ? talk : mood === "shock" ? "wide" : "closed"}
                blink={isBlinking(g)} look={f >= VTX + 4 ? [1, -0.3] : f >= travel ? [0.2, -0.6] : [0, 0]} turn={0.05} tail={6 * Math.sin(g * 0.12)} />
            </g>
          </Layer>
        </g>
      } />
      <div style={{ position: "absolute", right: 120, top: 120, opacity: title, transform: `translateY(${(1 - title) * 20}px)`, textAlign: "right",
        fontFamily: "'Noto Sans','DejaVu Sans',sans-serif" }}>
        <div style={{ fontWeight: 800, fontSize: 64, color: "#1f1a17", letterSpacing: "-0.01em" }}>A Day in the Stone Age</div>
        <div style={{ fontSize: 32, color: "#5c4a38", marginTop: 6 }}>11,000 years ago</div>
      </div>
      <Vortex r={vr} f={f} cx={1300} cy={420} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------ 2 · Ice Age valley

const Scene2: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const { c } = cueOf("s2");
  const [ending, glaciers, mammoths] = c;
  const LAND = 20;
  // he falls out of the shrinking vortex onto the snowbank
  const fall = clamp(f / LAND, 0, 1);
  const y = f < LAND ? lerp(-260, 900, fall * fall) : 900;
  const land = f >= LAND ? pop(f, LAND, 6) : 0;
  const squash = f >= LAND && f < LAND + 10 ? 0.12 * Math.sin(((f - LAND) / 10) * Math.PI) : 0;
  const shiver = f >= ending && f < glaciers ? 2.2 * Math.sin(f * 2.1) : 0;
  const hug = tweak(STAND, { ra: [28, -118], la: [-28, 118], tilt: 4, lean: 4 });
  const point = tweak(POINT, { ra: [92, -4], tilt: -6 });
  const cheer = tweak(CHEER, { ra: [128, 30 + 12 * Math.sin(f * 0.5)], la: [-128, -30 - 12 * Math.sin(f * 0.5)] });
  let pose: Pose = f < LAND ? SCARED : mix(SCARED, STAND, land);
  pose = mix(pose, hug, pop(f, ending));
  pose = mix(pose, point, pop(f, glaciers + 4));
  pose = mix(pose, cheer, pop(f, mammoths + 10));
  let mood: Mood = "scared";
  if (f >= LAND) mood = "confused";
  if (f >= ending) mood = "worried";
  if (f >= glaciers + 4) mood = "surprised";
  if (f >= mammoths + 4) mood = "shock";
  if (f >= mammoths + 14) mood = "excited";
  const look: [number, number] = f >= mammoths ? [1, -0.2] : f >= glaciers ? [0.9, -0.5] : f >= LAND ? [Math.sin(f * 0.15), 0] : [0, -1];
  const cam = camAt(f, [[0, { x: -40, y: 20, z: 1.06 }], [glaciers, { x: -40, y: 20, z: 1.06 }], [glaciers + 30, { x: 60, y: -10, z: 1.06 }], [mammoths + 4, { x: 60, y: -10, z: 1.06 }], [mammoths + 40, { x: 90, y: 30, z: 1.12 }]]);
  const vr = f < 16 ? interpolate(f, [0, 16], [1500, 0], { extrapolateRight: "clamp" }) : 0;
  const trunk = f >= mammoths + 6 && f < mammoths + 40 ? -40 * Math.sin(((f - mammoths - 6) / 34) * Math.PI) : undefined;
  const sx = shake(f, LAND, 8, 10);
  const whip = ramp(f, 170, 180);
  const puff = f >= LAND && f < LAND + 18 ? (f - LAND) / 18 : -1;
  return (
    <AbsoluteFill style={{ transform: `translateX(${sx - whip * 260}px) scale(${1 + whip * 0.3})`, filter: whip > 0.02 ? `blur(${whip * 16}px)` : undefined }}>
      <IceValleySet f={g} cam={cam} herdX={-f * 0.9} trunk={trunk} mid={
        <g>
          <KeylineDefs />
          <Layer cam={cam} depth={1}>
            {puff >= 0 && [-1, 1].map((s) => [0, 1, 2].map((i) => (
              <circle key={`${s}${i}`} cx={360 + s * (20 + puff * (50 + i * 30))} cy={900 - puff * (10 + i * 8)} r={10 + i * 4 + puff * 8} fill="#ffffff" stroke="#c9dceb" strokeWidth={3} opacity={1 - puff} />
            )))}
            <g filter="url(#keyline)">
              <g transform={`translate(${shiver} 0)`}>
                <g transform={`translate(360 ${y}) scale(${1 + squash * 0.6} ${1 - squash}) translate(-360 ${-y})`}>
                  <Stickman d={M} x={360} y={y} scale={1.08} pose={pose} mood={mood} blink={isBlinking(g)} look={look} turn={0.4} tail={f < LAND ? 30 : 8 * Math.sin(g * 0.12)} />
                </g>
              </g>
            </g>
          </Layer>
        </g>
      } />
      <Vortex r={vr} f={f + 156} cx={420} cy={180} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------ 3 · gathering berries

export const PICK = 40; // Ama's pick cycle in frames
const Scene3: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const { c, end } = cueOf("s3");
  const [people, tasty, some] = c;
  const EAT1 = tasty + 2; // the monkey eats his first berry on "tasty"
  const OFFER = tasty + 30; // Tuk offers him another
  const EAT2 = some + 6; // and he eats it on "Some..."
  const YUCK = some + 26; // "...not so much!"
  // Ama: reach into the bush, bring a berry to the basket
  const cyc = (f % PICK) / PICK;
  const reachK = cyc < 0.45 ? easeInOut(cyc / 0.45) : 1 - easeInOut((cyc - 0.45) / 0.55);
  const amaPose = mix(tweak(STAND, { ra: [40, 40], la: [20, 40], lean: 4, tilt: 6 }), tweak(REACH, { ra: [92, -10], la: [30, 40], lean: 9, tilt: 8, ll: [-10, 0], rl: [14, 0] }), reachK);
  const amaLaugh = tweak(STAND, { ra: [40, 100], la: [-20, 30], lean: -6, tilt: -10 });
  const laughK = pop(f, YUCK + 8);
  const picked = Math.min(9, Math.floor(f / PICK) + (cyc > 0.45 ? 1 : 0));
  // Tuk: munches, then offers the monkey a berry, then laughs
  const munch = (f % 30) / 30;
  const tukEat = tweak(STAND, { ra: [12, -150 + 20 * Math.sin(munch * Math.PI * 2)], la: [-30, 20], tilt: -6 });
  const tukOffer = tweak(STAND, { ra: [88, -4], la: [-20, 20], lean: 8, tilt: -6 });
  const tukLaugh = tweak(STAND, { ra: [60, 100], la: [-60, -100], lean: -6, tilt: 12 });
  let tukPose = mix(tukEat, tukOffer, ramp(f, OFFER, OFFER + 10));
  tukPose = mix(tukPose, tweak(STAND, { ra: [20, 20] }), ramp(f, EAT2 - 4, EAT2 + 4));
  tukPose = mix(tukPose, tukLaugh, pop(f, YUCK + 4));
  const tukMood: Mood = f >= YUCK + 4 ? "laugh" : f >= OFFER ? "cheeky" : munch < 0.5 ? "happy" : "smile";
  // the monkey
  const hold = tweak(STAND, { ra: [40, 110], la: [-14, 12], tilt: 8 });
  const toMouth = tweak(STAND, { ra: [20, -150], la: [-14, 12], tilt: -4 });
  const yum = tweak(STAND, { ra: [60, 60], la: [-30, 20], tilt: -10, lean: -4 });
  const take = tweak(STAND, { ra: [80, -10], la: [-14, 12], lean: 6 });
  const yuck = tweak(STAND, { ra: [30, 140], la: [-40, -30], lean: -10, tilt: -16 });
  let mp: Pose = hold;
  mp = mix(mp, toMouth, ramp(f, EAT1 - 6, EAT1));
  mp = mix(mp, yum, ramp(f, EAT1 + 4, EAT1 + 12));
  mp = mix(mp, take, ramp(f, OFFER + 6, OFFER + 14));
  mp = mix(mp, toMouth, ramp(f, EAT2 - 6, EAT2));
  mp = mix(mp, yuck, pop(f, YUCK));
  const chew = f >= EAT1 && f < EAT1 + 30 ? (Math.floor((f - EAT1) / 4) % 2 ? "open" : "closed") : f >= EAT2 && f < YUCK ? (Math.floor((f - EAT2) / 4) % 2 ? "open" : "closed") : "closed";
  let mMood: Mood = f < people + 10 ? "curious" : "neutral";
  if (f >= people + 10) mMood = "curious";
  if (f >= EAT1) mMood = "happy";
  if (f >= EAT1 + 10 && f < OFFER) mMood = "proud";
  if (f >= OFFER) mMood = "excited";
  if (f >= EAT2) mMood = "smile";
  if (f >= YUCK - 6) mMood = "worried";
  if (f >= YUCK) mMood = "disgust";
  const shudder = f >= YUCK && f < YUCK + 16 ? 4 * Math.sin(f * 2.4) * (1 - (f - YUCK) / 16) : 0;
  const holdBerry = f < EAT1 - 1 || (f >= OFFER + 12 && f < EAT2 - 1);
  const cam = camAt(f, [[0, { x: 20, y: 150, z: 1.4 }], [some, { x: 60, y: 150, z: 1.48 }], [YUCK + 4, { x: 220, y: 190, z: 1.72 }], [198, { x: 230, y: 195, z: 1.74 }]]);
  const enter = 1 - ramp(f, 0, 10); // the whip pan lands
  return (
    <AbsoluteFill style={{ transform: `translateX(${enter * 260}px) scale(${1 + enter * 0.3})`, filter: enter > 0.02 ? `blur(${enter * 16}px)` : undefined }}>
      <MeadowSet f={g} picked={picked} cam={cam} mid={
        <g>
          <KeylineDefs />
          <Layer cam={cam} depth={1}>
            <g filter="url(#keyline)">
              <Basket x={700} y={968} s={0.75} berries={4 + picked} />
              <Stickman d={AMA_STICK} x={590} y={960} pose={mix(amaPose, amaLaugh, laughK)} face={-1}
                mood={f >= YUCK + 8 ? "laugh" : reachK > 0.6 ? "focused" : "happy"} look={f >= YUCK + 8 ? [-1, 0] : [-1, 0.3]} turn={-0.5} blink={isBlinking(g + 30)}
                hold={(h) => (laughK < 0.5 && cyc > 0.45 && cyc < 0.9 ? <Berry x={h.near[0]} y={h.near[1]} r={8} /> : null)} />
              <Stickman d={TUK_STICK} x={880} y={972} pose={tukPose} mood={tukMood} talk={f < OFFER && munch < 0.5 ? "open" : "closed"}
                turn={0.4} look={f >= OFFER ? [1, 0] : [0.3, 0]} blink={isBlinking(g + 60)}
                hold={(h) => (f < EAT2 - 2 ? <Berry x={h.near[0]} y={h.near[1] + 4} r={8} /> : null)} />
              <g transform={`translate(${shudder} 0)`}>
                <Stickman d={M} x={1130} y={968} pose={mp} face={-1} mood={mMood} talk={chew as Talk} blink={isBlinking(g)}
                  look={f >= OFFER && f < EAT2 ? [1, 0.2] : f < EAT1 ? [0.6, -0.9] : [0, 0]} turn={0.2} tail={f >= YUCK ? 22 * Math.sin(f * 0.9) * Math.exp(-(f - YUCK) / 20) : 6 * Math.sin(g * 0.1)}
                  hold={(h) => (holdBerry ? <Berry x={h.near[0]} y={h.near[1] - 12} r={10} /> : null)} />
              </g>
              {f >= YUCK && f < YUCK + 30 && (
                <g transform={`translate(1060 ${640 - (f - YUCK) * 1.5})`} opacity={1 - (f - YUCK) / 30}>
                  <path d="M 0 0 q 10 -16 0 -30 M 16 6 q 14 -18 4 -36 M -16 6 q -10 -18 0 -34" stroke="#6f9a3b" strokeWidth={6} fill="none" strokeLinecap="round" />
                </g>
              )}
            </g>
          </Layer>
        </g>
      } />
      {end > 0 && null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------ 4 · stone tools

export const KNAP = 26; // Oru's strike period
export const KNAP_HIT = 18; // impact frame inside the period
const strike = (p: number) => {
  if (p < KNAP_HIT - 5) return 150 - 10 * easeInOut(p / (KNAP_HIT - 5)); // lift and hold (anticipation)
  if (p < KNAP_HIT) return 140 - 100 * ((p - (KNAP_HIT - 5)) / 5); // fast strike
  return 40 + 110 * easeInOut((p - KNAP_HIT) / (KNAP - KNAP_HIT)); // recoil
};
export const s4Cues = () => {
  const { c } = cueOf("s4");
  return { practice: c[1], ouch: c[2], stopOru: c[1] - 6 };
};
const Scene4: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const { c } = cueOf("s4");
  const [, practice, ouch] = c;
  const STOP = practice - 6; // Oru stops to watch the monkey try
  const BONK = ouch - 3;
  const knapping = f < STOP;
  const p = ((f % KNAP) + KNAP) % KNAP;
  const oruArm = knapping ? strike(p) : 60;
  const oruBase = tweak(SIT_GROUND, { la: [70, 20], lean: 14 });
  const oruWatch = tweak(SIT_GROUND, { ra: [40, 60], la: [60, 30], lean: 4, tilt: 8 });
  const oruLaugh = tweak(SIT_GROUND, { ra: [50, 100], la: [40, 60], lean: -8, tilt: -12 });
  const oruShow = tweak(SIT_GROUND, { ra: [132, 34], la: [40, 40], lean: -2, tilt: -8 });
  let oru: Pose = tweak(oruBase, { ra: [oruArm, -30] });
  oru = mix(oru, oruWatch, ramp(f, STOP, STOP + 10));
  oru = mix(oru, oruLaugh, pop(f, BONK + 8));
  oru = mix(oru, oruShow, pop(f, BONK + 28));
  const oruMood: Mood = f >= BONK + 28 ? "proud" : f >= BONK + 8 ? "laugh" : f >= STOP ? "curious" : "focused";
  // flakes from the last impact
  const since = knapping ? (p - KNAP_HIT + KNAP) % KNAP : 99;
  const flakes = knapping && f > KNAP_HIT && since < 14
    ? [[-1.4, -7], [1.0, -9], [2.2, -5], [-2.4, -4]].map(([vx, vy], i) => (
        <Flint key={i} x={1040 + vx * since * 3} y={912 + vy * since + 0.5 * since * since} r={since * 24 + i * 60} s={0.4} />
      ))
    : null;
  // the monkey: watches, tries, hits his thumb
  const squat: Pose = { la: [30, 40], ra: [60, 40], ll: [70, -140], rl: [84, -150], lean: 12, tilt: 8 };
  const raise: Pose = { ...squat, ra: [150, 20], la: [50, 60], lean: 4, tilt: -6 };
  const hit: Pose = { ...squat, ra: [60, 10], la: [50, 60], lean: 18, tilt: 10 };
  const hurt: Pose = { la: [70, 110], ra: [-30, 40], ll: [-10, 0], rl: [30, -50], lean: -6, tilt: -14 };
  let mp: Pose = squat;
  mp = mix(mp, raise, ramp(f, practice, BONK - 6));
  mp = mix(mp, hit, ramp(f, BONK - 3, BONK));
  mp = mix(mp, hurt, pop(f, BONK + 2, 8));
  const jump = f >= BONK + 2 && f < BONK + 18 ? Math.sin(((f - BONK - 2) / 16) * Math.PI) * 50 : 0;
  const hop = f >= BONK + 2 ? 1 : 0;
  let mMood: Mood = "curious";
  if (f >= practice - 2) mMood = "focused";
  if (f >= BONK) mMood = "pain";
  if (f >= BONK + 26) mMood = "sad";
  const shakeHand = f >= BONK + 4 && f < BONK + 40 ? 10 * Math.sin(f * 1.6) : 0;
  const cam = camAt(f, [[0, { x: 40, y: 120, z: 1.22 }], [STOP, { x: 20, y: 140, z: 1.3 }], [BONK - 4, { x: -20, y: 150, z: 1.42 }], [192, { x: 40, y: 130, z: 1.36 }]]);
  const sx = shake(f, BONK, 12, 12);
  return (
    <AbsoluteFill style={{ transform: `translateX(${sx}px)` }}>
      <CampSet f={g} cam={cam} mid={
        <g>
          <KeylineDefs />
          <Layer cam={cam} depth={1}>
            <g filter="url(#keyline)">
              <Flint x={1030} y={922} s={1.3} r={10} />
              {flakes}
              <Stickman d={ORU_STICK} x={1190} y={1000} scale={1.1} pose={oru} face={-1} mood={oruMood} seat={40} blink={isBlinking(g + 50)}
                look={f >= STOP && f < BONK + 28 ? [1, 0.2] : f >= BONK + 28 ? [0, -0.6] : [1, 0.7]} turn={0.3}
                hold={(h) => (f >= BONK + 28 ? <Blade x={h.near[0]} y={h.near[1] - 30} s={1.1} r={-10} /> : <Hammerstone x={h.near[0]} y={h.near[1]} s={0.95} />)} />
              <g transform={`translate(0 ${-jump * hop})`}>
                <Stickman d={M} x={760} y={1010} scale={1.1} pose={tweak(mp, f >= BONK + 2 ? { la: [mp.la[0] + shakeHand, mp.la[1]] } : {})} seat={f < BONK + 2 ? 56 : undefined}
                  mood={mMood} blink={isBlinking(g)} look={f < practice ? [1, 0.4] : f < BONK ? [1, 0.7] : [-0.4, 0.3]} turn={0.3} tail={f >= BONK ? 26 * Math.sin(f * 0.8) * Math.exp(-(f - BONK) / 24) : 8 * Math.sin(g * 0.1)}
                  hold={(h) => (f < BONK + 2 ? <Hammerstone x={h.near[0]} y={h.near[1]} s={0.85} /> : null)} />
              </g>
              {f >= BONK && f < BONK + 24 && (
                <g transform={`translate(830 ${760 - (f - BONK) * 2})`} opacity={1 - (f - BONK) / 24}>
                  {[0, 1, 2].map((i) => (
                    <path key={i} transform={`rotate(${f * 8 + i * 120}) translate(26 0)`} d="M 0 -9 L 2.5 -2.5 L 9 0 L 2.5 2.5 L 0 9 L -2.5 2.5 L -9 0 L -2.5 -2.5 Z" fill="#f4d35e" stroke="#1f1a17" strokeWidth={2} />
                  ))}
                </g>
              )}
              {f >= BONK + 30 && (
                <g opacity={ramp(f, BONK + 30, BONK + 36)}>
                  {[0, 60, 120, 180, 240, 300].map((a) => (
                    <path key={a} transform={`translate(1110 700) rotate(${a + f * 3})`} d={`M 0 -46 L 0 ${-60 - 5 * Math.sin(f * 0.5)}`} stroke="#fff4c2" strokeWidth={5} strokeLinecap="round" />
                  ))}
                </g>
              )}
            </g>
          </Layer>
        </g>
      } />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------ 5 · campfire

const Scene5: React.FC<{ f: number; g: number }> = ({ f, g }) => {
  const { v, end } = cueOf("s5");
  const YAWN = v + 72;
  const DOZE = v + 104;
  const UP = end - 4; // the camera rises to the stars
  const tell = tweak(SIT_GROUND, {
    la: [-110 + 20 * Math.sin(f * 0.13), -30 + 20 * Math.sin(f * 0.2)],
    ra: [118 + 22 * Math.sin(f * 0.13 + 1.4), 30 + 20 * Math.sin(f * 0.17)],
    lean: 6 + 4 * Math.sin(f * 0.1), tilt: 6 * Math.sin(f * 0.13),
  });
  const kid = tweak(SIT_GROUND, { lean: 12 + 3 * Math.sin(f * 0.08), tilt: -8, ra: [70, 40], la: [60, 50] });
  const roast = tweak(SIT_GROUND, { ra: [80 + 3 * Math.sin(f * 0.15), 10], la: [40, 40], lean: 8 });
  const oru = tweak(SIT_GROUND, { tilt: 10 * Math.max(0, Math.sin(f * 0.12)), ra: [35, 50], la: [25, 60] });
  const warm = tweak(SIT, { ra: [80, -20], la: [70, -10], lean: 10 });
  const yawn = tweak(SIT, { ra: [150, 30], la: [-150, -30], lean: -8, tilt: -12 });
  const doze = tweak(SIT, { ra: [30, 40], la: [20, 40], lean: 6, tilt: 18 });
  let mp: Pose = warm;
  mp = mix(mp, yawn, ramp(f, YAWN, YAWN + 8));
  mp = mix(mp, doze, ramp(f, YAWN + 26, YAWN + 36));
  const mMood: Mood = f >= DOZE ? "sleepy" : f >= YAWN ? "surprised" : "happy";
  const mTalk: Talk = f >= YAWN && f < YAWN + 26 ? "wide" : "closed";
  const tukMood: Mood = f < v + 30 ? "curious" : f < v + 70 ? "surprised" : "excited";
  const cam = camAt(f, [[0, { x: 0, y: 40, z: 1.08 }], [UP, { x: 30, y: 70, z: 1.16 }], [174, { x: 30, y: -560, z: 1.0 }]]);
  const fadeIn = ramp(f, 0, 14);
  const title = ramp(f, UP + 10, UP + 26);
  const shadowWalk = f * 0.12;
  return (
    <AbsoluteFill>
      <NightSet f={g} cam={cam}
        shadow={<g transform={`translate(${1440 + 30 * Math.sin(f * 0.05)} 600) scale(0.5)`}><Mammoth x={0} y={0} s={1} walk={shadowWalk} trunk={12 * Math.sin(f * 0.1)} /></g>}
        mid={
          <g>
            <KeylineDefs />
            <Layer cam={cam} depth={1}>
              <g filter="url(#keyline)">
                <Stickman d={ORU_STICK} x={1110} y={850} scale={0.86} pose={oru} seat={34} face={-1} mood={f > v + 50 ? "laugh" : "happy"} blink={isBlinking(g + 50)} />
                <Stickman d={NANA_STICK} x={560} y={900} pose={tell} seat={36} mood={f % 60 < 30 ? "excited" : "happy"} talk={Math.floor(f / 5) % 3 === 0 ? "open" : "closed"} look={[1, -0.5]} blink={isBlinking(g + 10)} />
                <Stickman d={TUK_STICK} x={740} y={960} pose={kid} seat={24} mood={tukMood} look={[1, -0.9]} blink={isBlinking(g + 70)} />
                <Stickman d={AMA_STICK} x={1250} y={960} pose={roast} seat={34} face={-1} mood="happy" blink={isBlinking(g + 30)}
                  hold={(h) => (
                    <g>
                      <Stick from={[h.near[0], h.near[1]]} to={[h.near[0] + 170, h.near[1] - 70]} />
                      <ellipse cx={h.near[0] + 160} cy={h.near[1] - 66} rx={20} ry={13} fill="#8c4a2a" stroke="#1f1a17" strokeWidth={3} />
                    </g>
                  )} />
                <Stickman d={M} x={1480} y={880} pose={mp} seat={0} face={-1} mood={mMood} talk={mTalk} blink={f < YAWN && isBlinking(g)} look={[1, 0]} tail={6 * Math.sin(g * 0.08)} />
              </g>
            </Layer>
          </g>
        } />
      <AbsoluteFill style={{ background: "#0b0f22", opacity: 1 - fadeIn }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", opacity: title, transform: `translateY(${(1 - title) * 24}px)`,
        fontFamily: "'Noto Sans','DejaVu Sans',sans-serif", color: "#fff3c4" }}>
        <div style={{ fontWeight: 800, fontSize: 84, letterSpacing: "-0.01em" }}>A Day in the Stone Age</div>
        <div style={{ fontSize: 34, marginTop: 10, color: "#e8dcb4" }}>Full documentary coming soon</div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------ subtitles, sound, the cut

/** Phrase-by-phrase captions: each phrase shows from its cue to the next. */
const PHRASES: Record<string, string[]> = {
  s1: ["Hi!", "I'm your guide.", "Let's travel back eleven thousand years."],
  s2: ["The Ice Age is ending.", "Glaciers are melting,", "and mammoths roam the land."],
  s3: ["People gathered berries and roots.", "Most were tasty.", "Some... not so much!"],
  s4: ["Toolmakers chipped flint into razor-sharp blades.", "It takes practice.", "Ouch!"],
  s5: ["At night, families gathered round the fire, to share food and stories."],
};
const Captions: React.FC<{ g: number }> = ({ g }) => {
  for (const b of sb.beats) {
    const i0 = g - b.start;
    if (i0 < 0 || i0 > b.frames + 8) continue;
    const cs = CUES[b.id];
    let k = 0;
    cs.forEach((c, j) => { if (i0 >= c) k = j; });
    const text = PHRASES[b.id][k];
    const since = i0 - cs[k];
    const o = clamp(since / 5, 0, 1) * clamp((b.frames + 8 - i0) / 6, 0, 1);
    return (
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center", opacity: o }}>
        <div style={{ padding: "10px 28px", borderRadius: 18, background: "rgba(20,16,14,0.72)", color: "#fffaf0",
          fontFamily: "'Noto Sans','DejaVu Sans',sans-serif", fontWeight: 700, fontSize: 38, maxWidth: 1820, textAlign: "center", whiteSpace: "nowrap" }}>{text}</div>
      </div>
    );
  }
  return null;
};

type Cue = { file: string; f: number; vol: number };
export const SFX: Cue[] = (() => {
  const out: Cue[] = [];
  const s1 = cueOf("s1"), s2 = cueOf("s2"), s3 = cueOf("s3"), s4 = cueOf("s4");
  out.push({ file: "vortex", f: s1.c[2] + 36, vol: 0.45 });
  out.push({ file: "thud", f: 156 + 20, vol: 0.55 });
  out.push({ file: "drip", f: 156 + s2.c[1] + 8, vol: 0.4 });
  out.push({ file: "trumpet", f: 156 + s2.c[2] + 6, vol: 0.4 });
  out.push({ file: "whip", f: 336 - 8, vol: 0.4 });
  for (let t = Math.round(PICK * 0.45); t < 198 - 10; t += PICK) out.push({ file: "pop", f: 336 + t, vol: 0.3 });
  out.push({ file: "munch", f: 336 + s3.c[1] + 4, vol: 0.45 });
  out.push({ file: "munch", f: 336 + s3.c[2] + 8, vol: 0.45 });
  const stop = s4.c[1] - 6;
  for (let t = KNAP_HIT; t < stop; t += KNAP) out.push({ file: "knock", f: 534 + t, vol: 0.2 });
  out.push({ file: "bonk", f: 534 + s4.c[2] - 3, vol: 0.3 });
  out.push({ file: "sparkle", f: 534 + s4.c[2] + 25, vol: 0.4 });
  out.push({ file: "crackle", f: 726, vol: 0.35 }, { file: "crackle", f: 816, vol: 0.35 });
  out.push({ file: "crickets", f: 726, vol: 0.22 }, { file: "crickets", f: 816, vol: 0.22 });
  return out.filter((c) => c.f < TOTAL - 4);
})();

function musicVolume(f: number): number {
  const LOW = 0.11, HIGH = 0.22, RAMP = 8;
  let duck = 0;
  for (const b of sb.beats) {
    duck = Math.max(duck, interpolate(f, [b.start - RAMP, b.start, b.start + b.frames, b.start + b.frames + RAMP], [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  }
  const fade = Math.min(interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" }), interpolate(f, [TOTAL - 50, TOTAL], [1, 0], { extrapolateLeft: "clamp" }));
  return (HIGH + (LOW - HIGH) * duck) * fade;
}

const SceneAt: React.FC<{ id: string; from: number }> = ({ id, from }) => {
  const f = useCurrentFrame();
  const g = from + f;
  const states = useTalk();
  if (id === "s1") return <Scene1 f={f} g={g} talk={talkAt(states, "s1", g)} />;
  if (id === "s2") return <Scene2 f={f} g={g} />;
  if (id === "s3") return <Scene3 f={f} g={g} />;
  if (id === "s4") return <Scene4 f={f} g={g} />;
  return <Scene5 f={f} g={g} />;
};

const CaptionLayer: React.FC = () => <Captions g={useCurrentFrame()} />;

export const Test30: React.FC = () => (
  <AbsoluteFill style={{ background: "#0b0f22" }}>
    <Audio src={staticFile("music.mp3")} volume={(f) => musicVolume(f)} />
    {SCENES.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.len} name={s.id}>
        <SceneAt id={s.id} from={s.from} />
      </Sequence>
    ))}
    {sb.beats.map((b) => (
      <Sequence key={`v${b.id}`} from={b.start} name={`voice ${b.id}`} layout="none">
        <Audio src={staticFile(`voice-norm/${b.id}.wav`)} />
      </Sequence>
    ))}
    {SFX.map((c, i) => (
      <Sequence key={`x${i}`} from={c.f} name={`sfx ${c.file}`} layout="none">
        <Audio src={staticFile(`sfx/${c.file}.wav`)} volume={c.vol} />
      </Sequence>
    ))}
    <CaptionLayer />
  </AbsoluteFill>
);
