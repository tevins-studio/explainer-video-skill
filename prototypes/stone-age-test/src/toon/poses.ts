/** Poses for the rig in Figure.tsx. Degrees; 0 = hanging down, + = towards the facing side.
 *  Each limb is [upper, lower], the lower angle relative to the upper one. */
export type Pose = {
  la: [number, number]; // far arm
  ra: [number, number]; // near arm
  ll: [number, number]; // far leg
  rl: [number, number]; // near leg
  lean: number;
  tilt: number;
};

export const STAND: Pose = { la: [-14, 12], ra: [14, 14], ll: [-5, 0], rl: [5, 0], lean: 0, tilt: 0 };
export const HIPS: Pose = { la: [-40, 88], ra: [40, -88], ll: [-8, 0], rl: [8, 0], lean: -2, tilt: 4 };
export const POINT: Pose = { la: [-12, 14], ra: [98, -6], ll: [-6, 0], rl: [8, 0], lean: 4, tilt: -4 };
export const POINT_UP: Pose = { la: [-12, 14], ra: [138, 22], ll: [-6, 0], rl: [8, 0], lean: -4, tilt: -10 };
export const WAVE: Pose = { la: [-14, 12], ra: [122, 48], ll: [-5, 0], rl: [5, 0], lean: -2, tilt: 6 };
export const SHRUG: Pose = { la: [-34, -78], ra: [34, 78], ll: [-6, 0], rl: [6, 0], lean: -2, tilt: 10 };
export const CHEER: Pose = { la: [-128, -30], ra: [128, 30], ll: [-10, 0], rl: [10, 0], lean: -4, tilt: -6 };
export const PRESENT: Pose = { la: [-30, -20], ra: [70, 30], ll: [-6, 0], rl: [6, 0], lean: 2, tilt: 6 };
export const HOLD_UP: Pose = { la: [-14, 12], ra: [132, 34], ll: [-6, 0], rl: [6, 0], lean: -4, tilt: -8 };
export const THINK: Pose = { la: [30, 90], ra: [40, 120], ll: [-5, 0], rl: [5, 0], lean: 2, tilt: 8 };
export const SIT: Pose = { la: [20, 50], ra: [30, 50], ll: [84, -96], rl: [80, -90], lean: 4, tilt: 0 };
export const SIT_GROUND: Pose = { la: [24, 46], ra: [34, 44], ll: [96, -150], rl: [88, -140], lean: 8, tilt: 0 };
export const KNEEL: Pose = { la: [40, 40], ra: [46, 40], ll: [70, -150], rl: [84, -164], lean: 14, tilt: 8 };
export const CROUCH: Pose = { la: [40, 40], ra: [60, 30], ll: [60, -120], rl: [80, -130], lean: 26, tilt: 6 };
export const REACH: Pose = { la: [30, 20], ra: [100, -16], ll: [-14, 0], rl: [18, 0], lean: 18, tilt: -6 };
export const SCARED: Pose = { la: [-112, -50], ra: [112, 50], ll: [-10, 0], rl: [12, 0], lean: -12, tilt: -6 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const l2 = (a: [number, number], b: [number, number], t: number): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
export const mix = (a: Pose, b: Pose, t: number): Pose => ({
  la: l2(a.la, b.la, t), ra: l2(a.ra, b.ra, t), ll: l2(a.ll, b.ll, t), rl: l2(a.rl, b.rl, t),
  lean: lerp(a.lean, b.lean, t), tilt: lerp(a.tilt, b.tilt, t),
});
export const tweak = (p: Pose, o: Partial<Pose>): Pose => ({ ...p, ...o });

/** A walk cycle; ph advances about 0.22 per frame for a relaxed walk. */
export function walk(ph: number): Pose {
  const s = Math.sin(ph);
  const knee = (p: number) => -Math.max(0, -Math.cos(p)) * 46 - 4;
  return { ll: [24 * s, knee(ph)], rl: [-24 * s, knee(ph + Math.PI)], la: [-26 * s, 22], ra: [26 * s, 22], lean: 4, tilt: 2 * Math.sin(ph * 2) };
}

/** A run: longer stride, bent arms pumping, strong lean. ph advances about 0.38 per frame. */
export function run(ph: number): Pose {
  const s = Math.sin(ph);
  const knee = (p: number) => -Math.max(0, -Math.cos(p)) * 90 - 14;
  return { ll: [44 * s, knee(ph)], rl: [-44 * s, knee(ph + Math.PI)], la: [-50 * s, 80], ra: [50 * s, 80], lean: 14, tilt: 4 * Math.sin(ph * 2) };
}

/** Vertical bob for a walk or run, in px. */
export const bob = (ph: number, amp = 6) => -Math.abs(Math.cos(ph)) * amp;
