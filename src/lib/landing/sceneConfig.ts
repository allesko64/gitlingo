export const SKY_RAMP = [
  "#0a1230",
  "#0f1b3d",
  "#16265a",
  "#1f2f6b",
  "#2e3a7c",
  "#54407f",
  "#8a4580",
  "#c24285",
  "#e04088",
] as const;

export const SCENE_COLORS = {
  farHills: "#1a2a5e",
  midHills: "#142252",
  nearField: "#0d1a45",
  path: "#16265a",
  fence: "#1f2f6b",
  silhouette: "#060c24",
  cottageWall: "#0a1433",
  cloud: "#2e3a7c",
  cloudTop: "#3d4a8e",
  windowGlow: "#ffe9f1",
  star: "#ffffff",
  firefly: "#fff8e7",
} as const;

export const SCENE = {
  fps: 30,
  minPixel: 2,
  maxPixel: 6,
  pixelDivisor: 360,
  lastBandHeight: 3,
  ditherRows: 3,
  stars: { min: 40, max: 70, areaPerStar: 1500, plusShare: 0.12 },
  clouds: { count: 5, speedMin: 0.8, speedMax: 2.4 },
  trees: 6,
  fireflies: { min: 8, max: 12 },
  farHillSpeed: 2,
  parallax: { far: 3, mid: 6 },
  windmillFrameMs: 600,
  ground: { far: 78, mid: 56, near: 30 },
  compactGround: { far: 34, mid: 24, near: 12 },
} as const;
