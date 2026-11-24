import React from "react";
import { INK } from "../toon/palette";

export const FONT = "'Noto Sans','DejaVu Sans',sans-serif";
export const SheetBg: React.FC<{ title: string; sub?: string; children: React.ReactNode }> = ({ title, sub, children }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ background: "#f6efe2" }}>
    <rect x={0} y={0} width={1920} height={1080} fill="#f6efe2" />
    <text x={60} y={78} fontFamily={FONT} fontWeight={800} fontSize={44} fill={INK}>{title}</text>
    {sub && <text x={60} y={118} fontFamily={FONT} fontSize={24} fill="#7a6a55">{sub}</text>}
    {children}
  </svg>
);
export const Label: React.FC<{ x: number; y: number; t: string }> = ({ x, y, t }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill="#7a6a55">{t}</text>
);
