import React from "react";

/** The stickman face: simple enough for the style, expressive enough to read at a glance.
 *  Eyes: white with a black outline and a pupil that looks around; lids that close, squint,
 *  slant (anger, sadness) or become arcs (laughter). Brows: thick strokes that tilt and lift on
 *  their own. Mouths: real shapes, open and closed, with teeth and a tongue where it helps.
 *  No shine highlights and no oversized eyes: the face stays understated in size. */

export const FACE_INK = "#1f1a17";
const TONGUE = "#e07a73";

export type Mood =
  | "neutral" | "happy" | "excited" | "laugh" | "surprised" | "shock" | "scared" | "angry" | "sad"
  | "worried" | "confused" | "disgust" | "curious" | "cheeky" | "pain" | "focused" | "sleepy" | "proud"
  // older names, kept so earlier sheets still compile
  | "smile" | "talk" | "sour";
export type Talk = "closed" | "open" | "wide";
type P = [number, number];

type EyeShape = "eye" | "arc" | "squeeze" | "line";
type MouthShape = "smile" | "grin" | "laugh" | "o" | "scream" | "frown" | "sadOpen" | "clench" | "wavy" | "bleh" | "smirk" | "flat" | "hmm";
type Spec = {
  eye: EyeShape;
  open: [number, number]; // 1 = fully open, per eye (far, near)
  low?: number; // lower lid up (smiling eyes), 0..1
  slant?: number; // + = angry (inner corners down), - = sad (outer corners down)
  size?: number; // eye size, 1 normal
  pupil?: number;
  brow: [number, number]; // tilt per brow, + = inner end up (worry, sadness), - = inner end down (anger)
  lift: [number, number]; // brow height per brow
  mouth: MouthShape;
  sweat?: boolean;
  lines?: boolean; // shock lines
  q?: boolean; // a question mark (confusion)
  positive?: boolean; // talking opens a smile, not a neutral or sad mouth
  negative?: boolean;
};

const SPECS: Record<Mood, Spec> = {
  neutral: { eye: "eye", open: [0.9, 0.9], brow: [0, 0], lift: [0, 0], mouth: "smile" },
  happy: { eye: "eye", open: [1, 1], low: 0.16, brow: [-4, -4], lift: [3, 3], mouth: "grin", positive: true },
  excited: { eye: "eye", open: [1, 1], size: 1.12, pupil: 1.1, brow: [-6, -6], lift: [6, 6], mouth: "laugh", positive: true },
  laugh: { eye: "arc", open: [0, 0], brow: [-4, -4], lift: [5, 5], mouth: "laugh", positive: true },
  surprised: { eye: "eye", open: [1, 1], size: 1.15, pupil: 0.75, brow: [6, 6], lift: [8, 8], mouth: "o" },
  shock: { eye: "eye", open: [1, 1], size: 1.3, pupil: 0.55, brow: [10, 10], lift: [11, 11], mouth: "scream", lines: true, negative: true },
  scared: { eye: "eye", open: [1, 1], size: 1.2, pupil: 0.6, brow: [18, 18], lift: [8, 8], mouth: "scream", sweat: true, negative: true },
  angry: { eye: "eye", open: [0.75, 0.75], slant: 22, brow: [-24, -24], lift: [-2, -2], mouth: "clench", negative: true },
  sad: { eye: "eye", open: [0.75, 0.75], slant: -16, pupil: 1.05, brow: [20, 20], lift: [2, 2], mouth: "frown", negative: true },
  worried: { eye: "eye", open: [0.95, 0.95], slant: -8, brow: [16, 16], lift: [5, 5], mouth: "wavy", sweat: true, negative: true },
  confused: { eye: "eye", open: [1, 0.65], brow: [10, -12], lift: [8, -1], mouth: "hmm", q: true },
  disgust: { eye: "eye", open: [0.35, 0.7], slant: 10, low: 0.3, brow: [-14, 6], lift: [-1, 3], mouth: "bleh", negative: true },
  curious: { eye: "eye", open: [1, 0.85], size: 1.08, brow: [6, -4], lift: [9, 3], mouth: "o", positive: true },
  cheeky: { eye: "eye", open: [0.65, 0.9], low: 0.2, brow: [-10, 8], lift: [0, 6], mouth: "smirk", positive: true },
  pain: { eye: "squeeze", open: [0, 0], brow: [18, 18], lift: [3, 3], mouth: "clench", sweat: true, lines: true, negative: true },
  focused: { eye: "eye", open: [0.6, 0.6], slant: 8, brow: [-10, -10], lift: [-2, -2], mouth: "flat" },
  sleepy: { eye: "eye", open: [0.35, 0.35], brow: [4, 4], lift: [-2, -2], mouth: "flat" },
  proud: { eye: "arc", open: [0, 0], brow: [-2, -2], lift: [6, 6], mouth: "smile", positive: true },
  smile: { eye: "eye", open: [1, 1], low: 0.15, brow: [-2, -2], lift: [2, 2], mouth: "smile", positive: true },
  talk: { eye: "eye", open: [0.9, 0.9], brow: [2, 0], lift: [2, 2], mouth: "smile" },
  sour: { eye: "eye", open: [0.35, 0.7], slant: 10, low: 0.3, brow: [-14, 6], lift: [-1, 3], mouth: "bleh", negative: true },
};

let uid = 0;

export const Face: React.FC<{ mood: Mood; talk: Talk; blink: boolean; look: P; R: number; skin: string; monkey?: boolean }> = ({
  mood, talk, blink, look, R, skin, monkey,
}) => {
  const id = React.useMemo(() => `fc${uid++}`, []);
  const sp = SPECS[mood];
  const k = R / 44;
  const ex = 12.5 * k;
  const ey = (monkey ? -5 : -4) * k;
  const sz = sp.size ?? 1;
  const a = 6.6 * k * sz;
  const b = 8.4 * k * sz;
  const pr = 3.3 * k * (sp.pupil ?? 1);
  const my = (monkey ? 19 : 16) * k;
  const ink = FACE_INK;
  const st = (w = 2.6) => ({ stroke: ink, strokeWidth: w * k, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

  // ---- eyes
  const eye = (side: -1 | 1, i: 0 | 1) => {
    const cx = side * ex;
    const shut = blink && sp.eye === "eye";
    if (sp.eye === "arc") return <path key={side} d={`M ${cx - a} ${ey + 2 * k} Q ${cx} ${ey - b * 1.1} ${cx + a} ${ey + 2 * k}`} {...st(2.8)} />;
    if (sp.eye === "squeeze") return <path key={side} d={`M ${cx + side * a} ${ey - b * 0.6} L ${cx - side * a * 0.7} ${ey} L ${cx + side * a} ${ey + b * 0.6}`} {...st(2.8)} />;
    if (shut) return <path key={side} d={`M ${cx - a} ${ey + 1} Q ${cx} ${ey + b * 0.5} ${cx + a} ${ey + 1}`} {...st(2.6)} />;
    const open = sp.open[i];
    const px = cx + look[0] * (a - pr) * 0.8;
    const py = ey + look[1] * (b - pr) * 0.6 + (open < 0.6 ? b * 0.25 : 0);
    const lidY = ey - b + 2 * b * (1 - open);
    const slant = (sp.slant ?? 0) * -side; // inner corner is the one towards x = 0
    const cid = `${id}${side}`;
    return (
      <g key={side}>
        <defs><clipPath id={cid}><ellipse cx={cx} cy={ey} rx={a} ry={b} /></clipPath></defs>
        <ellipse cx={cx} cy={ey} rx={a} ry={b} fill="#ffffff" />
        <g clipPath={`url(#${cid})`}>
          <circle cx={px} cy={py} r={pr} fill={ink} />
          {(open < 0.98 || slant !== 0) && (
            <g transform={`rotate(${slant} ${cx} ${lidY})`}>
              <rect x={cx - a * 2} y={lidY - b * 3} width={a * 4} height={b * 3} fill={skin} />
              <path d={`M ${cx - a * 2} ${lidY} H ${cx + a * 2}`} stroke={ink} strokeWidth={2.4 * k} />
            </g>
          )}
          {(sp.low ?? 0) > 0 && (
            <path d={`M ${cx - a * 1.5} ${ey + b * 2} V ${ey + b - 2 * b * sp.low!} Q ${cx} ${ey + b - 2 * b * sp.low! - 4 * k} ${cx + a * 1.5} ${ey + b - 2 * b * sp.low!} V ${ey + b * 2} Z`}
              fill={skin} stroke={ink} strokeWidth={2.2 * k} />
          )}
        </g>
        <ellipse cx={cx} cy={ey} rx={a} ry={b} {...st(2.4)} />
      </g>
    );
  };

  // ---- brows: thick strokes, tilt and lift per side
  const brow = (side: -1 | 1, i: 0 | 1) => {
    const cx = side * ex;
    const cy = ey - b - 5 * k - sp.lift[i] * k;
    const ang = sp.brow[i] * -side;
    return <path key={side} d={`M ${cx - 6.5 * k} ${cy + 1 * k} Q ${cx} ${cy - 2.5 * k} ${cx + 6.5 * k} ${cy + 1 * k}`} transform={`rotate(${ang} ${cx} ${cy})`} {...st(3.4)} />;
  };

  // ---- mouth
  const openAmt = talk === "wide" ? 1 : talk === "open" ? 0.55 : 0;
  let shape: MouthShape = sp.mouth;
  if (openAmt > 0 && ["smile", "flat", "smirk", "hmm", "wavy", "frown"].includes(shape)) {
    shape = sp.positive || shape === "smile" ? "grin" : sp.negative ? "sadOpen" : "o";
  }
  const w = 10 * k;
  const fillD = (d: string, tongue: [number, number, number, number] | null, teeth?: "top" | "both") => (
    <g>
      <path d={d} fill={ink} />
      <clipPath id={`${id}m`}><path d={d} /></clipPath>
      <g clipPath={`url(#${id}m)`}>
        {tongue && <ellipse cx={tongue[0]} cy={tongue[1]} rx={tongue[2]} ry={tongue[3]} fill={TONGUE} />}
        {teeth && <rect x={-w * 2} y={my - 30 * k} width={w * 4} height={30 * k + (teeth ? 2.6 * k : 0)} fill="#ffffff" transform={`translate(0 ${-0.4 * k})`} />}
        {teeth === "both" && <rect x={-w * 2} y={my + 13 * k} width={w * 4} height={20 * k} fill="#ffffff" />}
      </g>
      <path d={d} {...st(2.4)} />
    </g>
  );
  const mouth = (() => {
    const g = 1 + openAmt * 0.6;
    switch (shape) {
      case "smile": return <path d={`M ${-w} ${my - 2 * k} Q 0 ${my + 7 * k} ${w} ${my - 2 * k}`} {...st(2.8)} />;
      case "frown": return <path d={`M ${-w * 0.85} ${my + 4 * k} Q 0 ${my - 4 * k} ${w * 0.85} ${my + 4 * k}`} {...st(2.8)} />;
      case "flat": return <path d={`M ${-w * 0.6} ${my} L ${w * 0.6} ${my}`} {...st(2.8)} />;
      case "smirk": return <path d={`M ${-w * 0.7} ${my + 1 * k} Q ${w * 0.25} ${my + 5 * k} ${w} ${my - 5 * k}`} {...st(2.8)} />;
      case "hmm": return <path d={`M ${-w * 0.3} ${my + 1 * k} Q ${w * 0.25} ${my - 1 * k} ${w * 0.7} ${my + 2 * k}`} {...st(2.8)} />;
      case "wavy": return <path d={`M ${-w * 0.9} ${my + 2 * k} q ${w * 0.225} -4 ${w * 0.45} 0 t ${w * 0.45} 0 t ${w * 0.45} 0 t ${w * 0.45} 0`} {...st(2.6)} />;
      case "grin": {
        const h = (7 + 5 * openAmt) * k;
        return fillD(`M ${-w} ${my - 2 * k} Q 0 ${my - 3.5 * k} ${w} ${my - 2 * k} Q ${w * 0.9} ${my - 2 * k + h * 1.4} 0 ${my - 2 * k + h * 1.4} Q ${-w * 0.9} ${my - 2 * k + h * 1.4} ${-w} ${my - 2 * k} Z`,
          [0, my - 2 * k + h * 1.35, w * 0.55, h * 0.5], "top");
      }
      case "laugh": {
        const h = 13 * k * g;
        return fillD(`M ${-w * 1.15} ${my - 4 * k} Q 0 ${my - 6 * k} ${w * 1.15} ${my - 4 * k} Q ${w} ${my - 4 * k + h * 1.3} 0 ${my - 4 * k + h * 1.3} Q ${-w} ${my - 4 * k + h * 1.3} ${-w * 1.15} ${my - 4 * k} Z`,
          [0, my - 4 * k + h * 1.25, w * 0.65, h * 0.45], "top");
      }
      case "o": {
        const rx = (4.5 + 2 * openAmt) * k;
        const ry = (6 + 3 * openAmt) * k;
        return fillD(`M ${-rx} ${my + 2 * k} A ${rx} ${ry} 0 1 0 ${rx} ${my + 2 * k} A ${rx} ${ry} 0 1 0 ${-rx} ${my + 2 * k} Z`, [0, my + 2 * k + ry * 0.8, rx * 0.7, ry * 0.4]);
      }
      case "scream": {
        const rx = 8 * k * g;
        const ry = 11 * k * g;
        return fillD(`M ${-rx} ${my + 3 * k} Q ${-rx} ${my + 3 * k - ry} 0 ${my + 3 * k - ry} Q ${rx} ${my + 3 * k - ry} ${rx} ${my + 3 * k} Q ${rx * 0.9} ${my + 3 * k + ry} 0 ${my + 3 * k + ry} Q ${-rx * 0.9} ${my + 3 * k + ry} ${-rx} ${my + 3 * k} Z`,
          [0, my + 3 * k + ry * 0.85, rx * 0.65, ry * 0.4]);
      }
      case "sadOpen": {
        const h = (5 + 6 * openAmt) * k;
        return fillD(`M ${-w * 0.85} ${my + 5 * k} Q 0 ${my + 5 * k - h * 1.6} ${w * 0.85} ${my + 5 * k} Q 0 ${my + 7 * k} ${-w * 0.85} ${my + 5 * k} Z`, [0, my + 6 * k, w * 0.45, h * 0.35]);
      }
      case "bleh":
        return (
          <g>
            {fillD(`M ${-w * 0.9} ${my + 3 * k} Q ${-w * 0.2} ${my - 5 * k} ${w * 0.9} ${my} Q ${w * 0.1} ${my + 6 * k} ${-w * 0.9} ${my + 3 * k} Z`, null)}
            <path d={`M ${-w * 0.1} ${my + 3 * k} q ${w * 0.1} ${9 * k} ${w * 0.55} ${6 * k} q ${w * 0.1} ${-4 * k} 0 ${-6 * k} Z`} {...st(2)} fill={TONGUE} />
          </g>
        );
      case "clench":
        return (
          <g>
            <path d={`M ${-w} ${my - 3 * k} Q 0 ${my - 5 * k} ${w} ${my - 3 * k} L ${w * 0.95} ${my + 5 * k} Q 0 ${my + 3 * k} ${-w * 0.95} ${my + 5 * k} Z`} {...st(2.4)} fill="#ffffff" />
            <path d={`M ${-w * 0.95} ${my + 1 * k} H ${w * 0.95} M ${-w * 0.35} ${my - 4 * k} V ${my + 4 * k} M ${w * 0.35} ${my - 4 * k} V ${my + 4 * k}`} {...st(1.8)} />
          </g>
        );
    }
  })();

  const extras = (
    <g>
      {sp.sweat && <path d={`M ${R * 0.8} ${-R * 0.5} q -6 11 0 15 q 6 -4 0 -15 Z`} {...st(2.2)} fill="#ffffff" />}
      {sp.lines && [-1, 1].map((s) => (
        <path key={s} d={`M ${s * R * 1.12} ${-R * 0.55} l ${s * 8 * k} ${-6 * k} M ${s * R * 1.2} ${-R * 0.25} l ${s * 10 * k} 0 M ${s * R * 1.12} ${R * 0.05} l ${s * 8 * k} ${6 * k}`} {...st(2.6)} />
      ))}
      {sp.q && (
        <g transform={`translate(${R * 0.85} ${-R * 1.25}) scale(${k})`}>
          <path d="M -6 -6 Q -6 -14 1 -14 Q 8 -14 8 -7 Q 8 -2 2 1 Q 0 2 0 6" stroke={ink} strokeWidth={3.4} fill="none" strokeLinecap="round" />
          <circle cx={0} cy={12} r={2.2} fill={ink} />
        </g>
      )}
    </g>
  );

  return <g>{eye(-1, 0)}{eye(1, 1)}{brow(-1, 0)}{brow(1, 1)}{mouth}{extras}</g>;
};
