/** Shared graph spacing. Positions only — not lane/diff logic. */

export const MOBILE_MAX = 640;

export const RIGHT_SPACE = 80;
export const UNBORN_WIDTH = 520;
export const HASH_GAP = 14;
export const REF_PILL_GAP = 14;
export const REF_PILL_HEIGHT = 28;
export const REF_PILL_RADIUS = 8;
export const HEAD_SEG_WIDTH = 52;
export const PILL_DIVIDER = 18;
export const CHAR_WIDTH = 7.4;
export const BRANCH_PAD_X = 20;
export const STEM_LENGTH = 36;
export const EDGE_STROKE = 2.5;
export const GUIDE_FADE = 120;
export const HEADER_H = 56;
export const DETAILS_H = 40;
export const PANEL_MIN_H = 240;
export const PANEL_MAX_H = 360;
export const DISPLAY_AUTHOR = "you";

export type GraphLayout = {
  xStep: number;
  laneStep: number;
  padX: number;
  padY: number;
  nodeRadius: number;
  headRingRadius: number;
  labelHeight: number;
  hashBelow: number;
  rightSpace: number;
  textBelow: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isMobileWidth(panelWidth: number): boolean {
  return panelWidth < MOBILE_MAX;
}

export function branchPillWidth(name: string): number {
  return Math.round(name.length * CHAR_WIDTH + BRANCH_PAD_X);
}

export function refPillWidth(name: string, withHead: boolean): number {
  const branch = branchPillWidth(name);
  return withHead ? HEAD_SEG_WIDTH + PILL_DIVIDER + branch : branch;
}

/** Desktop X_STEP grows when there are few commits so the graph fills the panel. */
export function resolveLayout(
  panelWidth: number,
  maxGen: number,
  viewportWidth: number = panelWidth,
): GraphLayout {
  const mobile = isMobileWidth(viewportWidth);
  const xStep = mobile
    ? 72
    : clamp((panelWidth - 200) / Math.max(maxGen, 3), 88, 128);
  const laneStep = mobile ? 64 : 72;
  const padX = mobile ? 40 : 56;
  const padY = mobile ? 40 : 48;
  const nodeRadius = mobile ? 8 : 9;
  const headRingRadius = mobile ? 13 : 15;
  const hashBelow = nodeRadius + HASH_GAP;
  return {
    xStep,
    laneStep,
    padX,
    padY,
    nodeRadius,
    headRingRadius,
    labelHeight: REF_PILL_HEIGHT,
    hashBelow,
    rightSpace: RIGHT_SPACE,
    textBelow: hashBelow + 16,
  };
}

/** Default layout for tests and SSR (desktop, roomy panel). */
export const GRAPH = resolveLayout(1280, 3);

export function panelHeight(laneCount: number, layout: GraphLayout): number {
  const raw = HEADER_H + Math.max(1, laneCount) * layout.laneStep + 2 * layout.padY + DETAILS_H;
  return Math.min(PANEL_MAX_H, Math.max(PANEL_MIN_H, raw));
}
