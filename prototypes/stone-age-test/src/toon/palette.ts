/** The house palette. Every scene and character takes its colours from here, so the style
 *  stays consistent. Each fill has a shade: one hard-edged shadow tone, no soft rendering. */
export const INK = "#2b211b"; // warm near-black, every outline
export const WHITE = "#fffaf0";

export const MONKEY = {
  fur: "#8b5a2b",
  furShade: "#6c431f",
  tuft: "#5a3718",
  face: "#f2d9ad",
  faceShade: "#dcbb86",
  shirt: "#3b7dd8",
  shirtShade: "#2c63b0",
  tie: "#d9443b",
  tieShade: "#b0322b",
  trousers: "#2f3443",
  trousersShade: "#232733",
};

export const SKIN = {
  light: ["#f3c9a1", "#dfae83"],
  medium: ["#d79e6c", "#bd8455"],
  deep: ["#9c6440", "#80502f"],
  tan: ["#e7b688", "#cc9a6c"],
} as const;

export const HAIR = { dark: "#3a2618", auburn: "#7b3b1d", grey: "#b8b0a5", chestnut: "#5c3420" };

export const HIDE = {
  ochre: "#c99a5e",
  ochreShade: "#a77c42",
  brown: "#8c5a34",
  brownShade: "#6e4425",
  fur: "#ece0c8",
  furShade: "#cdbd9f",
  cloak: "#5f7064",
  cloakShade: "#4a584e",
  leather: "#7a4c2c",
};

export const ACCENT = { red: "#d9443b", blue: "#3b7dd8", bead: "#e3b23c", teal: "#3a9e95" };

export const MOUTH = { inside: "#5b1f1d", tongue: "#e8726c", teeth: WHITE };

export const NATURE = {
  skyTop: "#7fb8e6",
  skyBottom: "#e4f1f6",
  far: "#a9c4da",
  farShade: "#93b1ca",
  hill: "#8fb46a",
  hillShade: "#76994f",
  grass: "#9cc363",
  grassShade: "#7fa64a",
  grassDark: "#5f8a3b",
  earth: "#c49565",
  earthShade: "#a77a4c",
  rock: "#a9a39a",
  rockShade: "#8a847c",
  rockDark: "#6f6a63",
  snow: "#f5f9fc",
  snowShade: "#cfe0ec",
  ice: "#bfe3f2",
  iceShade: "#8ec5df",
  water: "#4fa3dc",
  waterLight: "#a3d6f2",
  bark: "#7a5232",
  barkShade: "#5e3d23",
  leaf: "#4f8f45",
  leafShade: "#3d7336",
  leafLight: "#6fae55",
  berry: "#c9304a",
  berryShade: "#9b2238",
};

export const NIGHT = {
  skyTop: "#141c38",
  skyBottom: "#3a3b6b",
  far: "#2e3560",
  hill: "#27304f",
  ground: "#3b3a4f",
  groundShade: "#2d2c3d",
  rock: "#4a4a5e",
  rockShade: "#393949",
  star: "#fff3c4",
  fire1: "#ffd65c",
  fire2: "#ff9a2e",
  fire3: "#e8492f",
  glow: "#ffb459",
};

export const MUSEUM = {
  wall: "#efe3cd",
  wallShade: "#e2d2b5",
  floor: "#b98b5f",
  floorShade: "#a2774e",
  panel: "#7a4f32",
  bone: "#f1e6cf",
  boneShade: "#d8c7a5",
  rope: "#c9443b",
};
