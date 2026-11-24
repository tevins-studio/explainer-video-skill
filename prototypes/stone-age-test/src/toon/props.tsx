import React from "react";
import { HIDE, INK, NATURE, WHITE } from "./palette";

/** Props shared by the scenes. Same outline weight as the characters. */
const st = { stroke: INK, strokeWidth: 4.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const Flint: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M -18 8 L -12 -12 L 6 -17 L 20 -4 L 13 13 L -6 16 Z" fill="#6f7780" {...st} />
    <path d="M -10 -8 L 4 -12 L 12 -2" fill="none" stroke="#9aa3ad" strokeWidth={4} strokeLinecap="round" />
  </g>
);

export const Hammerstone: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={20} ry={15} fill={NATURE.rock} {...st} />
    <ellipse cx={5} cy={5} rx={10} ry={6} fill={NATURE.rockShade} />
    <ellipse cx={0} cy={0} rx={20} ry={15} fill="none" {...st} />
  </g>
);

export const Blade: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M 0 -46 L 14 -8 L 9 16 L -9 16 L -14 -8 Z" fill="#7d8792" {...st} />
    <path d="M 0 -38 L 6 -6 L 0 10" fill="none" stroke="#b5bec7" strokeWidth={4} strokeLinecap="round" />
  </g>
);

export const Basket: React.FC<{ x: number; y: number; s?: number; berries?: number }> = ({ x, y, s = 1, berries = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: berries }, (_, i) => (
      <circle key={i} cx={-34 + ((i * 19) % 68)} cy={-66 - Math.floor(i / 4) * 7} r={10} fill={NATURE.berry} {...st} strokeWidth={3} />
    ))}
    <path d="M -54 -66 L 54 -66 L 42 0 L -42 0 Z" fill={HIDE.ochre} {...st} />
    <path d="M -50 -44 L 50 -44 M -46 -22 L 46 -22" stroke={HIDE.ochreShade} strokeWidth={5} />
    <path d="M -24 -66 L -20 0 M 0 -66 L 0 0 M 24 -66 L 20 0" stroke={HIDE.ochreShade} strokeWidth={4} />
    <path d="M -54 -66 L 54 -66 L 42 0 L -42 0 Z" fill="none" {...st} />
    <path d="M -58 -66 Q 0 -150 58 -66" fill="none" stroke={HIDE.leather} strokeWidth={8} />
    <path d="M -58 -66 Q 0 -150 58 -66" fill="none" stroke={INK} strokeWidth={2} />
  </g>
);

export const Berry: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 10 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={NATURE.berry} {...st} strokeWidth={3} />
    <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.28} fill={WHITE} opacity={0.8} />
  </g>
);

export const Stick: React.FC<{ from: [number, number]; to: [number, number] }> = ({ from, to }) => (
  <g>
    <path d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} stroke={INK} strokeWidth={15} strokeLinecap="round" />
    <path d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} stroke={NATURE.bark} strokeWidth={7} strokeLinecap="round" />
  </g>
);
