import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import rawStoryboard from "../storyboard.json";
import envelopes from "./envelopes.json";
import { Subtitle, spans } from "./Subtitle";
import { FPS, clamp, easeInOut, mouthStates } from "./motion";
import { BERRY_PERIOD, FIRE, KNAP_FROM, SceneFire, SceneLandscape, SceneSurvival, knapHits } from "./Scenes";
import type { SceneProps } from "./Scenes";
import { INK, PAPER } from "./Stick";
import type { Beat, Storyboard } from "./types";

const storyboard = rawStoryboard as Storyboard;
const GAP = Math.round(storyboard.gap_s * FPS);

/** One beat = one scene. This map is the file you edit to restage the video. */
const SCENES: Record<string, React.FC<SceneProps>> = {
  b01: SceneLandscape,
  b02: SceneSurvival,
  b03: SceneFire,
};

type Slot = { beat: Beat; start: number; frames: number };

export function layout(ids?: string[]): { slots: Slot[]; total: number } {
  const beats = storyboard.beats.filter((b) => !ids || ids.includes(b.id));
  const slots: Slot[] = [];
  let t = 0;
  beats.forEach((beat) => {
    const frames = beat.frames + GAP;
    slots.push({ beat, start: t, frames });
    t += frames;
  });
  return { slots, total: Math.max(t, 1) };
}

/** Transitions, one per cut (SKILL.md: no single fade for every cut).
 *  wipe = a cream paper sheet with a hand-drawn edge sweeps across; iris = closes to the fire. */
const TR = 10;
const Wipe: React.FC<{ local: number; frames: number; out: boolean }> = ({ local, frames, out }) => {
  // out: covering at the end of a scene; in: uncovering at the start of the next
  const k = out ? easeInOut(clamp((local - (frames - TR)) / TR, 0, 1)) : 1 + easeInOut(clamp(local / TR, 0, 1));
  if (k <= 0 || k >= 2) return null;
  const x = -2200 + k * 2100; // sheet's leading edge from -100 to 2000 and beyond
  const edge = Array.from({ length: 12 }, (_, i) => `L ${x + 2100 + (i % 2 ? 26 : -14)} ${i * 100}`).join(" ");
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <path d={`M ${x} -20 L ${x + 2100} -20 ${edge} L ${x + 2100} 1100 L ${x} 1100 Z`} fill={PAPER} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    </svg>
  );
};
const Iris: React.FC<{ r: number; cx: number; cy: number }> = ({ r, cx, cy }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <path fillRule="evenodd" fill={INK}
      d={`M -10 -10 H 1930 V 1090 H -10 Z M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`} />
  </svg>
);

const BeatScene: React.FC<{ slot: Slot; index: number; count: number }> = ({ slot, index, count }) => {
  const local = useCurrentFrame();
  const { beat, start, frames } = slot;
  const env = (envelopes as Record<string, number[]>)[beat.id] ?? [];
  const states = React.useMemo(() => mouthStates(env.length ? env : [0]), [beat.id]);
  const f = Math.min(local, Math.max(0, env.length - 1));
  const speaking = local < beat.frames;
  const Scene = SCENES[beat.id];
  const sp = spans(beat.line, beat.frames).map((s) => s.start);
  const first = index === 0;
  const last = index === count - 1;
  const fadeIn = first ? interpolate(local, [0, 8], [0, 1], { extrapolateRight: "clamp" }) : 1;
  const fadeOut = last ? interpolate(local, [frames - 10, frames], [1, 0], { extrapolateLeft: "clamp" }) : 1;
  // cut 1 -> 2: paper wipe. cut 2 -> 3: iris that closes on scene 2 and opens on the fire.
  const irisOut = beat.id === "b02" ? (1 - easeInOut(clamp((local - (frames - 12)) / 12, 0, 1))) * 1200 : null;
  const irisIn = beat.id === "b03" ? easeInOut(clamp(local / 16, 0, 1)) * 1200 : null;
  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, background: PAPER }}>
      {Scene && <Scene f={local} len={frames} global={start + local} mouth={speaking ? states[f] : "closed"} spans={sp} />}
      {beat.id === "b01" && <Wipe local={local} frames={frames} out />}
      {beat.id === "b02" && <Wipe local={local} frames={frames} out={false} />}
      {irisOut !== null && irisOut < 1199 && <Iris r={irisOut} cx={960} cy={720} />}
      {irisIn !== null && irisIn < 1199 && <Iris r={irisIn} cx={FIRE[0]} cy={FIRE[1] - 90} />}
      <Subtitle line={beat.line} speaker={beat.speaker} local={local} voiceFrames={beat.frames} />
      <Audio src={staticFile(`voice-norm/${beat.id}.wav`)} />
    </AbsoluteFill>
  );
};

function musicVolume(slots: Slot[], total: number): (f: number) => number {
  const speech = slots.map((s) => [s.start, s.start + s.beat.frames] as const);
  const LOW = 0.12, HIGH = 0.22, RAMP = 9;
  return (f) => {
    let duck = 0;
    for (const [a, b] of speech) {
      duck = Math.max(duck, interpolate(f, [a - RAMP, a, b, b + RAMP], [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    }
    const fade = Math.min(interpolate(f, [0, 30], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(f, [total - 75, total], [1, 0], { extrapolateLeft: "clamp" }));
    return (HIGH + (LOW - HIGH) * duck) * fade;
  };
}

/** Sound effects per beat, in frames inside the beat. Keyed to the same constants the scenes use. */
type Cue = { file: string; f: number; vol: number };
const slotOf = (id: string) => layout().slots.find((s) => s.beat.id === id);
const SFX: Record<string, Cue[]> = (() => {
  const b01 = slotOf("b01");
  const b02 = slotOf("b02");
  const out: Record<string, Cue[]> = { b01: [], b02: [], b03: [] };
  for (let k = 0; k < 92 / 7.5; k++) out.b01.push({ file: "step", f: Math.round(6 + k * 11.6), vol: 0.25 });
  if (b01) out.b01.push({ file: "whoosh", f: b01.frames - TR - 2, vol: 0.3 });
  if (b02) {
    knapHits(b02.frames, KNAP_FROM).forEach((h) => out.b02.push({ file: "knock", f: h, vol: 0.38 }));
    for (let t = Math.round(BERRY_PERIOD * 0.45); t < b02.frames - 10; t += BERRY_PERIOD) out.b02.push({ file: "pop", f: t + 18, vol: 0.22 });
  }
  out.b03.push({ file: "crackle", f: 0, vol: 0.35 }, { file: "crackle", f: 90, vol: 0.35 });
  return out;
})();

export const Body: React.FC<{ ids?: string[] }> = ({ ids }) => {
  const { slots, total } = layout(ids);
  const vol = React.useMemo(() => musicVolume(slots, total), [ids]);
  return (
    <AbsoluteFill style={{ background: INK }}>
      {storyboard.beats.length > 0 && <Audio src={staticFile("music.mp3")} volume={vol} />}
      {slots.map((s, i) => (
        <Sequence key={s.beat.id} from={s.start} durationInFrames={s.frames} layout="none">
          <Sequence from={0} durationInFrames={s.frames} name={s.beat.id}>
            <BeatScene slot={s} index={i} count={slots.length} />
          </Sequence>
          {(SFX[s.beat.id] ?? []).map((c, k) => (
            <Sequence key={k} from={c.f} layout="none" name={`sfx ${c.file}`}>
              <Audio src={staticFile(`sfx/${c.file}.wav`)} volume={c.vol} />
            </Sequence>
          ))}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
