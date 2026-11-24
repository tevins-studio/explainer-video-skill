import React from "react";
import { HIDE, INK, NATURE, NIGHT, WHITE } from "./palette";

/** Reusable scenery. Near things get the full ink outline; far things are outlined in a darker
 *  tone of their own colour and get lighter and cooler with distance (aerial perspective). */
const st = (w = 4.5) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });

/** Deterministic pseudo-random, so a scene draws the same on every frame. */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Sky: React.FC<{ id: string; top: string; bottom: string; h?: number }> = ({ id, top, bottom, h = 1080 }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect x={-1200} y={-800} width={4320} height={h + 800} fill={`url(#${id})`} />
  </>
);

export const Cloud: React.FC<{ x: number; y: number; s?: number; color?: string; line?: string }> = ({ x, y, s = 1, color = WHITE, line = "#c9dbe8" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 20 Q -120 -20 -76 -22 Q -64 -64 -16 -56 Q 14 -90 58 -60 Q 106 -66 104 -22 Q 132 -12 118 20 Z" fill={color} stroke={line} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -96 18 Q 0 6 108 18" stroke={line} strokeWidth={3} fill="none" opacity={0.6} />
  </g>
);

export const Sun: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 70 }) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.7} fill="#fff6d6" opacity={0.45} />
    <circle cx={x} cy={y} r={r} fill="#ffe7a1" stroke="#f2c45f" strokeWidth={5} />
  </g>
);

/** A mountain range: peaks given as [x, y]. Snow caps follow each peak. */
export const Range: React.FC<{ peaks: [number, number][]; base: number; fill: string; shade: string; snow?: boolean; line?: string; snowLine?: number }> = ({
  peaks, base, fill, shade, snow = true, line, snowLine = 90,
}) => {
  const pts = [[-1200, base] as [number, number], ...peaks, [3120, base] as [number, number]];
  const d = `M ${pts.map((p) => p.join(" ")).join(" L ")} Z`;
  return (
    <g>
      <path d={d} fill={fill} stroke={line ?? shade} strokeWidth={4} strokeLinejoin="round" />
      {/* one shadow face per peak: the right flank */}
      {peaks.map(([x, y], i) => {
        const nx = peaks[i + 1]?.[0] ?? x + 300;
        const valley = (x + nx) / 2;
        return <path key={i} d={`M ${x} ${y} L ${valley} ${base} L ${x + (valley - x) * 0.2} ${base} Z`} fill={shade} opacity={0.75} />;
      })}
      {snow && peaks.map(([x, y], i) => {
        const w = snowLine * 0.9;
        return (
          <path key={`s${i}`} d={`M ${x} ${y} L ${x + w} ${y + snowLine} L ${x + w * 0.5} ${y + snowLine * 0.78} L ${x + w * 0.15} ${y + snowLine * 1.02} L ${x - w * 0.25} ${y + snowLine * 0.74} L ${x - w * 0.62} ${y + snowLine * 0.96} L ${x - w * 0.9} ${y + snowLine} Z`}
            fill={NATURE.snow} stroke={line ?? shade} strokeWidth={3.5} strokeLinejoin="round" />
        );
      })}
    </g>
  );
};

/** A rolling band of land with a lit top and a shadow underside. */
export const Hill: React.FC<{ d: string; fill: string; shade?: string; line?: string; w?: number }> = ({ d, fill, line = INK, w = 4.5 }) => (
  <path d={d} fill={fill} stroke={line} strokeWidth={w} strokeLinejoin="round" />
);

export const Pine: React.FC<{ x: number; y: number; s?: number; snow?: boolean; far?: boolean }> = ({ x, y, s = 1, snow = false, far = false }) => {
  const line = far ? "#4e7a63" : INK;
  const fill = far ? "#6f9f80" : "#3f7a52";
  const shade = far ? "#5e8f70" : "#2f6141";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-8} y={-40} width={16} height={44} fill={NATURE.bark} stroke={line} strokeWidth={4} />
      {[0, 1, 2].map((i) => {
        const w = 74 - i * 18;
        const yy = -30 - i * 58;
        return (
          <g key={i}>
            <path d={`M ${-w} ${yy} Q 0 ${yy - 30} ${w} ${yy} L 0 ${yy - 110} Z`} fill={fill} stroke={line} strokeWidth={4} strokeLinejoin="round" />
            <path d={`M 0 ${yy - 104} L ${w - 8} ${yy - 4} Q ${w * 0.5} ${yy - 14} 0 ${yy - 16} Z`} fill={shade} />
            {snow && <path d={`M ${-w * 0.5} ${yy - 55} L 0 ${yy - 110} L ${w * 0.5} ${yy - 55} Q 0 ${yy - 70} ${-w * 0.5} ${yy - 55} Z`} fill={NATURE.snow} stroke={line} strokeWidth={3} />}
          </g>
        );
      })}
    </g>
  );
};

/** A broadleaf tree: trunk and a cloud of leaf lobes, one shade side. */
export const LeafTree: React.FC<{ x: number; y: number; s?: number; sway?: number; tone?: number }> = ({ x, y, s = 1, sway = 0, tone = 0 }) => {
  const lobes: [number, number, number][] = [[-70, -250, 62], [0, -290, 74], [70, -248, 64], [-30, -200, 60], [40, -196, 58], [-100, -196, 46], [104, -200, 48]];
  const leaf = tone ? NATURE.leafLight : NATURE.leaf;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -14 0 Q -10 -90 -6 -170 L 8 -170 Q 12 -90 18 0 Z M -4 -120 Q -40 -150 -60 -180 M 6 -140 Q 40 -170 56 -196" fill={NATURE.bark} {...st()} />
      <g transform={`rotate(${sway} 0 -150)`}>
        {lobes.map(([cx, cy, r], i) => <circle key={`o${i}`} cx={cx} cy={cy} r={r} fill={INK} stroke={INK} strokeWidth={9} />)}
        {lobes.map(([cx, cy, r], i) => <circle key={`f${i}`} cx={cx} cy={cy} r={r} fill={leaf} />)}
        {lobes.map(([cx, cy, r], i) => <circle key={`s${i}`} cx={cx + r * 0.25} cy={cy + r * 0.3} r={r * 0.62} fill={NATURE.leafShade} opacity={0.55} />)}
        {[[-40, -270], [30, -310], [80, -262], [-90, -220]].map(([cx, cy], i) => (
          <path key={`h${i}`} d={`M ${cx} ${cy} q 10 -8 20 0`} stroke={NATURE.leafLight} strokeWidth={6} fill="none" strokeLinecap="round" />
        ))}
      </g>
    </g>
  );
};

export const Rock: React.FC<{ x: number; y: number; s?: number; flip?: boolean; color?: string; shade?: string }> = ({ x, y, s = 1, flip = false, color = NATURE.rock, shade = NATURE.rockShade }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M -80 0 Q -88 -46 -50 -64 Q -20 -96 26 -82 Q 70 -76 82 -34 Q 90 -8 80 0 Z" fill={color} {...st()} />
    <path d="M 26 -82 Q 70 -76 82 -34 Q 90 -8 80 0 L 20 0 Q 44 -30 26 -82 Z" fill={shade} />
    <path d="M -46 -50 q 20 -16 44 -10" stroke={WHITE} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />
    <path d="M -80 0 Q -88 -46 -50 -64 Q -20 -96 26 -82 Q 70 -76 82 -34 Q 90 -8 80 0 Z" fill="none" {...st()} />
  </g>
);

export const Tuft: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = NATURE.grassDark }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M -16 0 Q -14 -20 -22 -34 Q -6 -20 -4 0 Z M -4 0 Q 0 -30 -2 -46 Q 10 -26 8 0 Z M 6 0 Q 14 -18 24 -28 Q 18 -10 18 0 Z"
    fill={color} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
);

export const Fern: React.FC<{ x: number; y: number; s?: number; flip?: boolean; sway?: number }> = ({ x, y, s = 1, flip = false, sway = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${sway})`}>
    {[-40, -15, 10, 35].map((a, k) => (
      <g key={k} transform={`rotate(${a})`}>
        <path d="M 0 0 Q 10 -90 0 -180" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M 0 0 Q 10 -90 0 -180" stroke={NATURE.leafShade} strokeWidth={4} fill="none" strokeLinecap="round" />
        {Array.from({ length: 8 }, (_, i) => {
          const t = 0.15 + i * 0.1;
          const yy = -180 * t;
          const len = 34 * (1 - t * 0.7);
          return (
            <g key={i}>
              <path d={`M 4 ${yy} q ${len * 0.6} -6 ${len} -${len * 0.5} q -${len * 0.5} ${len * 0.5} -${len} ${len * 0.5} Z`} fill={NATURE.leaf} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
              <path d={`M 2 ${yy} q -${len * 0.6} -6 -${len} -${len * 0.5} q ${len * 0.5} ${len * 0.5} ${len} ${len * 0.5} Z`} fill={NATURE.leafLight} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
            </g>
          );
        })}
      </g>
    ))}
  </g>
);

export const Flower: React.FC<{ x: number; y: number; c?: string; s?: number }> = ({ x, y, c = "#f4d35e", s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 0 L 0 -26" stroke={NATURE.leafShade} strokeWidth={4} />
    {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-34} rx={5} ry={8} transform={`rotate(${a} 0 -26)`} fill={c} stroke={INK} strokeWidth={2} />)}
    <circle cx={0} cy={-26} r={4} fill="#c9443b" />
  </g>
);

/** A berry bush. picked = how many berries are gone (they disappear from the front first). */
export const BerryBush: React.FC<{ x: number; y: number; s?: number; picked?: number; rustle?: number }> = ({ x, y, s = 1, picked = 0, rustle = 0 }) => {
  const lobes: [number, number, number][] = [[-90, -70, 60], [-30, -110, 70], [50, -100, 66], [100, -60, 54], [0, -50, 70], [-110, -30, 42], [120, -26, 40]];
  const berries: [number, number][] = [[20, -40], [-40, -70], [70, -70], [-80, -40], [10, -110], [-30, -140], [60, -130], [100, -40], [-110, -80], [40, -10], [-60, -10], [90, -100], [-10, -80], [130, -60]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rustle} 0 0)`}>
      {lobes.map(([cx, cy, r], i) => <circle key={`o${i}`} cx={cx} cy={cy} r={r} fill={INK} stroke={INK} strokeWidth={9} />)}
      {lobes.map(([cx, cy, r], i) => <circle key={`f${i}`} cx={cx} cy={cy} r={r} fill={NATURE.leaf} />)}
      {lobes.map(([cx, cy, r], i) => <circle key={`s${i}`} cx={cx + r * 0.3} cy={cy + r * 0.35} r={r * 0.55} fill={NATURE.leafShade} opacity={0.55} />)}
      {berries.slice(0, berries.length - picked).map(([bx, by], i) => (
        <g key={`b${i}`}>
          <circle cx={bx} cy={by} r={11} fill={NATURE.berry} stroke={INK} strokeWidth={3} />
          <circle cx={bx + 9} cy={by + 6} r={9} fill={NATURE.berry} stroke={INK} strokeWidth={3} />
          <circle cx={bx - 3} cy={by - 4} r={3} fill={WHITE} opacity={0.8} />
        </g>
      ))}
    </g>
  );
};

/** A woolly mammoth in profile, facing left. walk = phase for the leg swing. */
export const Mammoth: React.FC<{ x: number; y: number; s?: number; walk?: number; trunk?: number; far?: boolean; flip?: boolean }> = ({ x, y, s = 1, walk = 0, trunk = 0, far = false, flip = false }) => {
  const fur = far ? "#a4785a" : "#8a4f2b";
  const shade = far ? "#8f6649" : "#6b3a1f";
  const line = far ? "#6e4c34" : INK;
  const w = far ? 3.5 : 5;
  const legSt = { stroke: line, strokeWidth: w, strokeLinejoin: "round" as const };
  const leg = (lx: number, ph: number, back: boolean) => {
    const a = 14 * Math.sin(walk + ph);
    return (
      <g transform={`rotate(${a} ${lx} -120)`}>
        <path d={`M ${lx - 26} -130 L ${lx - 24} -6 Q ${lx} 6 ${lx + 24} -6 L ${lx + 26} -130 Z`} fill={back ? shade : fur} {...legSt} />
        <path d={`M ${lx - 24} -16 L ${lx - 16} -2 M ${lx - 4} -12 L ${lx} 0 M ${lx + 12} -14 L ${lx + 16} -2`} stroke={line} strokeWidth={3} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {leg(-40, Math.PI, true)}{leg(120, 0, true)}
      {/* body with a shaggy fringe */}
      <path d={`M 190 -140 Q 210 -250 130 -290 Q 60 -330 -20 -300 Q -90 -330 -130 -280 Q -150 -230 -146 -170
        L -150 -120 L -136 -100 L -126 -122 L -112 -96 L -98 -124 L -80 -100 L -64 -126 L -40 -104 L -24 -128 L 0 -106 L 20 -130 L 44 -106 L 64 -130 L 90 -104 L 110 -128 L 134 -104 L 154 -130 L 176 -108 L 196 -132 Z`}
        fill={fur} stroke={line} strokeWidth={w} strokeLinejoin="round" />
      <path d="M 196 -132 Q 150 -170 160 -240 Q 200 -200 190 -140 Z M -10 -140 Q 60 -170 150 -150 L 154 -130 L 134 -104 L 110 -128 L 90 -104 L 64 -130 L 44 -106 L 20 -130 L 0 -106 Z" fill={shade} opacity={0.8} />
      <path d="M -40 -250 q 20 -16 40 0 M 40 -270 q 20 -16 40 0 M 100 -240 q 16 -14 32 0" stroke={shade} strokeWidth={5} fill="none" strokeLinecap="round" />
      {leg(-90, 0, false)}{leg(80, Math.PI, false)}
      {/* head, dome and trunk */}
      <g transform={`rotate(${trunk * 0.3} -150 -250)`}>
        <path d={`M -120 -300 Q -150 -380 -210 -350 Q -250 -320 -240 -260 Q -236 -230 -226 -210
          Q ${-232 - trunk} -150 ${-250 - trunk * 1.4} -110 Q ${-262 - trunk * 1.6} -80 ${-238 - trunk * 1.5} -76 Q ${-218 - trunk} -90 ${-206 - trunk * 0.6} -140 Q -196 -190 -170 -210 Q -140 -230 -120 -300 Z`}
          fill={fur} stroke={line} strokeWidth={w} strokeLinejoin="round" />
        <path d="M -150 -280 Q -126 -290 -126 -250 Q -130 -222 -156 -232 Z" fill={shade} stroke={line} strokeWidth={w - 1} />
        <circle cx={-205} cy={-285} r={6} fill={INK} />
        <path d="M -216 -298 q 10 -8 20 -2" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* tusk */}
        <path d="M -214 -216 Q -280 -180 -290 -240 Q -284 -270 -268 -280 Q -276 -240 -246 -226 Q -230 -222 -206 -238 Z" fill={WHITE} stroke={line} strokeWidth={w - 1} strokeLinejoin="round" />
      </g>
      {/* tail */}
      <path d="M 192 -220 Q 220 -200 214 -160" stroke={line} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M 214 -160 l -8 16 l 12 -4 l 6 12 l 4 -20 Z" fill={shade} stroke={line} strokeWidth={3} />
    </g>
  );
};

export const Bird: React.FC<{ x: number; y: number; f: number; ph?: number; s?: number }> = ({ x, y, f, ph = 0, s = 1 }) => {
  const w = 12 * Math.sin(f * 0.4 + ph);
  return <path transform={`translate(${x} ${y}) scale(${s})`} d={`M -22 ${-w} Q -10 -6 0 2 Q 10 -6 22 ${-w}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
};

export const Tent: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 -300 L 0 -250 L 38 -310 M -14 -310 L 0 -250 L 18 -320" stroke={NATURE.bark} strokeWidth={10} strokeLinecap="round" />
    <path d="M -40 -300 L 0 -250 L 38 -310 M -14 -310 L 0 -250 L 18 -320" stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill="none" />
    <path d="M -190 0 L 0 -262 L 190 0 Z" fill={HIDE.ochre} {...st()} />
    <path d="M 0 -262 L 190 0 L 60 0 Z" fill={HIDE.ochreShade} />
    <path d="M -60 0 L 0 -110 L 60 0 Z" fill="#4a2f1c" {...st()} />
    <path d="M -110 -110 l 30 -8 M -140 -50 l 30 -6 M 90 -120 l 24 8 M 120 -60 l 28 6" stroke={HIDE.brown} strokeWidth={5} strokeLinecap="round" />
    <path d="M -190 0 L 0 -262 L 190 0 Z" fill="none" {...st()} />
  </g>
);

export const Smoke: React.FC<{ x: number; y: number; f: number; s?: number; color?: string }> = ({ x, y, f, s = 1, color = "#e9e4dc" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2, 3, 4].map((i) => {
      const t = ((f * 0.8 + i * 40) % 200) / 200;
      return <circle key={i} cx={30 * Math.sin(t * 5 + i)} cy={-t * 300} r={18 + t * 40} fill={color} opacity={0.55 * (1 - t)} />;
    })}
  </g>
);

/** A campfire with animated flames. glow adds the light pool on the ground. */
export const Campfire: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const flame = (k: number, w: number, h: number, ph: number, fill: string) => {
    const a = 1 + 0.12 * Math.sin(f * 0.55 + ph) + 0.06 * Math.sin(f * 1.3 + ph * 2);
    const lean = 12 * Math.sin(f * 0.3 + ph);
    return (
      <path d={`M ${k - w} 0 Q ${k - w * 1.15} ${-h * 0.55 * a} ${k + lean} ${-h * a} Q ${k + w * 1.15} ${-h * 0.55 * a} ${k + w} 0 Z`}
        fill={fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: 8 }, (_, i) => {
        const t = ((f * 1.4 + i * 23) % 90) / 90;
        return <circle key={i} cx={46 * Math.sin(i * 2.1 + t * 5)} cy={-70 - t * 280} r={5 * (1 - t) + 1.5} fill={NIGHT.fire1} opacity={1 - t} />;
      })}
      {[-92, -52, -6, 40, 84].map((dx, i) => <ellipse key={i} cx={dx} cy={10 - Math.abs(dx) * 0.06} rx={26} ry={16} fill={NATURE.rockShade} {...st(4)} />)}
      {flame(0, 66, 170, 0, NIGHT.fire3)}
      {flame(-28, 36, 110, 1.7, NIGHT.fire3)}
      {flame(26, 38, 120, 3.1, NIGHT.fire3)}
      {flame(0, 42, 118, 0.9, NIGHT.fire2)}
      {flame(0, 20, 64, 2.4, NIGHT.fire1)}
      <path d="M -86 8 L 86 -20" stroke={INK} strokeWidth={30} strokeLinecap="round" />
      <path d="M -86 -20 L 86 8" stroke={INK} strokeWidth={30} strokeLinecap="round" />
      <path d="M -86 8 L 86 -20" stroke={NATURE.bark} strokeWidth={21} strokeLinecap="round" />
      <path d="M -86 -20 L 86 8" stroke={NATURE.bark} strokeWidth={21} strokeLinecap="round" />
      <circle cx={86} cy={-20} r={10} fill="#e0a66a" stroke={INK} strokeWidth={3} />
      <circle cx={86} cy={8} r={10} fill="#e0a66a" stroke={INK} strokeWidth={3} />
    </g>
  );
};

export const Stars: React.FC<{ f: number; n?: number; w?: number; h?: number }> = ({ f, n = 60, w = 2200, h = 560 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = -140 + rnd(i) * w;
      const y = 10 + rnd(i + 99) * h;
      const tw = 0.55 + 0.45 * Math.abs(Math.sin(f * 0.06 + i));
      const big = rnd(i + 7) > 0.85;
      return big ? (
        <path key={i} transform={`translate(${x} ${y}) scale(${tw})`} d="M 0 -12 L 3 -3 L 12 0 L 3 3 L 0 12 L -3 3 L -12 0 L -3 -3 Z" fill={NIGHT.star} />
      ) : (
        <circle key={i} cx={x} cy={y} r={2 + rnd(i + 3) * 2} fill={NIGHT.star} opacity={tw} />
      );
    })}
  </g>
);
