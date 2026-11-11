"use client";

import { useEffect, useRef } from "react";
import { SCENE, SCENE_COLORS, SKY_RAMP } from "@/lib/landing/sceneConfig";

type Mode = "hero" | "compact";
type Rng = () => number;
type Point = [number, number];

interface Star {
  x: number;
  y: number;
  phase: number;
  speed: number;
  plus: boolean;
}

interface Cloud {
  image: HTMLCanvasElement;
  x0: number;
  y: number;
  speed: number;
}

interface Tree {
  x: number;
  pine: boolean;
  size: number;
  period: number;
  phase: number;
}

interface Firefly {
  cx: number;
  cy: number;
  a: number;
  b: number;
  speed: number;
  phase: number;
}

interface World {
  w: number;
  h: number;
  mode: Mode;
  sky: HTMLCanvasElement;
  stars: Star[];
  moon: Point[];
  clouds: Cloud[];
  trees: Tree[];
  fireflies: Firefly[];
  farTop: (x: number) => number;
  midTop: (x: number) => number;
  nearTop: (x: number) => number;
  windmillX: number;
  cottageX: number;
  windowAlpha: number;
  nextFlicker: number;
}

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function between(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function canvas2d(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("Canvas 2D is not available");
  }
  return { canvas, ctx };
}

function buildSky(w: number, height: number): HTMLCanvasElement {
  const { canvas, ctx } = canvas2d(w, height);
  const image = ctx.createImageData(w, height);
  const colors = SKY_RAMP.map(hexToRgb);
  const last = colors.length - 1;
  const upper = Math.max(last, height - SCENE.lastBandHeight);
  const bandHeight = upper / last;
  const d = SCENE.ditherRows;

  for (let y = 0; y < height; y++) {
    const band = y >= upper ? last : Math.min(last - 1, Math.floor(y / bandHeight));
    const rowsLeft = (band + 1) * bandHeight - y;
    const blend = band < last && rowsLeft <= d ? (d - rowsLeft + 1) / (d + 1) : 0;

    for (let x = 0; x < w; x++) {
      const useNext = blend > 0 && BAYER[y & 3][x & 3] < blend * 16;
      const [r, g, b] = colors[useNext ? band + 1 : band];
      const i = (y * w + x) * 4;
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = b;
      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

function buildCloud(cw: number, ch: number, rng: Rng): HTMLCanvasElement {
  const { canvas, ctx } = canvas2d(cw, ch);
  const blobs = [0.3, 0.55, 0.78].map((fx) => {
    const ry = between(rng, ch * 0.5, ch * 0.95);
    return { cx: cw * fx, cy: ch - ry, rx: between(rng, cw * 0.18, cw * 0.28), ry };
  });

  const filled = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= cw || y >= ch) {
      return false;
    }
    if (y >= ch - 2 && x >= cw * 0.12 && x <= cw * 0.88) {
      return true;
    }
    return blobs.some(({ cx, cy, rx, ry }) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1);
  };

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      if (filled(x, y)) {
        ctx.fillStyle = filled(x, y - 1) ? SCENE_COLORS.cloud : SCENE_COLORS.cloudTop;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  return canvas;
}

function wave(rng: Rng, base: number, a1: number, a2: number) {
  const f1 = between(rng, 0.012, 0.02);
  const f2 = between(rng, 0.035, 0.06);
  const p1 = between(rng, 0, Math.PI * 2);
  const p2 = between(rng, 0, Math.PI * 2);
  return (x: number) =>
    Math.round(base - a1 * (0.5 + 0.5 * Math.sin(x * f1 + p1)) - a2 * (0.5 + 0.5 * Math.sin(x * f2 + p2)));
}

function createWorld(w: number, h: number, mode: Mode): World {
  const rng = makeRng(20261111);
  const ground = mode === "hero" ? SCENE.ground : SCENE.compactGround;
  const farBase = h - ground.far;
  const skyHeight = Math.max(SKY_RAMP.length, farBase + 6);

  const starRows = Math.max(8, Math.floor(farBase * 0.6));
  const starCount = Math.min(
    SCENE.stars.max,
    Math.max(mode === "hero" ? SCENE.stars.min : 20, Math.round((w * h) / SCENE.stars.areaPerStar)),
  );
  const stars = Array.from({ length: starCount }, () => ({
    x: Math.floor(between(rng, 0, w)),
    y: Math.floor(between(rng, 1, starRows)),
    phase: between(rng, 0, Math.PI * 2),
    speed: between(rng, 0.3, 1.2),
    plus: rng() < SCENE.stars.plusShare,
  }));

  const moon: Point[] = [];
  const mx = Math.round(w * 0.88);
  const my = Math.min(48, Math.max(7, Math.round(farBase * 0.3)));
  const r = 5;
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const inside = x * x + y * y <= r * r;
      const bite = (x - 2) ** 2 + (y + 1) ** 2 <= r * r;
      if (inside && !bite) {
        moon.push([mx + x, my + y]);
      }
    }
  }

  const sizes: Point[] = [
    [14, 5],
    [20, 6],
    [28, 8],
  ];
  const cloudCount = mode === "hero" ? SCENE.clouds.count : 3;
  const clouds = Array.from({ length: cloudCount }, (_, i) => {
    const [cw, ch] = sizes[i % sizes.length];
    return {
      image: buildCloud(cw, ch, rng),
      x0: between(rng, 0, w + cw),
      y: Math.floor(between(rng, farBase * 0.15, farBase * 0.55)),
      speed: between(rng, SCENE.clouds.speedMin, SCENE.clouds.speedMax),
    };
  });

  const treeSpots = [0.06, 0.15, 0.26, 0.79, 0.88, 0.96];
  const trees = treeSpots.slice(0, SCENE.trees).map((fx, i) => ({
    x: Math.round(w * fx + between(rng, -3, 3)),
    pine: i % 2 === 0,
    size: Math.round(between(rng, 4, 6)),
    period: between(rng, 2.5, 5),
    phase: between(rng, 0, 5),
  }));

  const nearBase = h - ground.near;
  const fireflyCount = mode === "hero" ? Math.round(between(rng, SCENE.fireflies.min, SCENE.fireflies.max)) : 4;
  const fireflies = Array.from({ length: fireflyCount }, () => ({
    cx: between(rng, w * 0.05, w * 0.95),
    cy: between(rng, nearBase - 14, h - 5),
    a: between(rng, 6, 14),
    b: between(rng, 3, 6),
    speed: between(rng, 0.15, 0.35),
    phase: between(rng, 0, Math.PI * 2),
  }));

  return {
    w,
    h,
    mode,
    sky: buildSky(w, skyHeight),
    stars,
    moon,
    clouds,
    trees,
    fireflies,
    farTop: wave(rng, farBase, 10, 6),
    midTop: wave(rng, h - ground.mid, 8, 4),
    nearTop: wave(rng, nearBase, 2, 1),
    windmillX: Math.round(w * 0.4),
    cottageX: Math.round(w * 0.63),
    windowAlpha: 1,
    nextFlicker: 0,
  };
}

function fillHills(ctx: CanvasRenderingContext2D, w: number, h: number, top: (x: number) => number, offset: number) {
  for (let x = 0; x < w; x++) {
    const y = top(x + offset);
    ctx.fillRect(x, y, 1, h - y);
  }
}

function drawWindmill(ctx: CanvasRenderingContext2D, x: number, baseY: number, frame: number) {
  ctx.fillStyle = SCENE_COLORS.silhouette;
  for (let i = 0; i < 12; i++) {
    const width = i < 6 ? 3 : 2;
    ctx.fillRect(x - 1, baseY - i, width, 1);
  }
  const hubX = x;
  const hubY = baseY - 12;
  ctx.fillRect(hubX, hubY, 1, 1);
  for (let arm = 0; arm < 4; arm++) {
    const angle = (frame * Math.PI) / 8 + (arm * Math.PI) / 2;
    for (let step = 1; step <= 6; step++) {
      ctx.fillRect(Math.round(hubX + Math.cos(angle) * step), Math.round(hubY + Math.sin(angle) * step), 1, 1);
    }
  }
}

function drawTree(ctx: CanvasRenderingContext2D, tree: Tree, baseY: number, t: number) {
  const sway = Math.floor((t + tree.phase) / tree.period) % 2;
  ctx.fillStyle = SCENE_COLORS.silhouette;
  ctx.fillRect(tree.x, baseY - 3, 1, 4);

  if (tree.pine) {
    for (let row = 0; row < tree.size + 4; row++) {
      const half = Math.floor(row / 2);
      ctx.fillRect(tree.x - half + sway, baseY - 3 - tree.size - 4 + row, half * 2 + 1, 1);
    }
    return;
  }

  const r = tree.size - 1;
  const cy = baseY - 3 - r;
  for (let y = -r; y <= r; y++) {
    const half = Math.floor(Math.sqrt(r * r - y * y));
    ctx.fillRect(tree.x - half + sway, cy + y, half * 2 + 1, 1);
  }
}

function drawCottage(ctx: CanvasRenderingContext2D, world: World, t: number) {
  const x = world.cottageX;
  const base = world.nearTop(x) + 3;
  const wallTop = base - 7;

  ctx.fillStyle = SCENE_COLORS.cottageWall;
  ctx.fillRect(x, wallTop, 12, 7);

  ctx.fillStyle = SCENE_COLORS.silhouette;
  for (let row = 0; row < 5; row++) {
    ctx.fillRect(x - 1 + row, wallTop - 1 - row, 14 - row * 2, 1);
  }
  ctx.fillRect(x + 9, wallTop - 6, 2, 4);
  ctx.fillRect(x + 8, base - 4, 2, 4);

  if (t >= world.nextFlicker) {
    world.windowAlpha = 0.8 + Math.random() * 0.2;
    world.nextFlicker = t + 0.12 + Math.random() * 0.28;
  }
  ctx.fillStyle = SCENE_COLORS.windowGlow;
  ctx.globalAlpha = world.windowAlpha * 0.15;
  ctx.fillRect(x + 1, wallTop + 1, 5, 4);
  ctx.globalAlpha = world.windowAlpha;
  ctx.fillRect(x + 2, wallTop + 2, 3, 2);

  ctx.fillStyle = SCENE_COLORS.star;
  for (let i = 0; i < 6; i++) {
    const age = (t + i * 1.1) % 6.6;
    ctx.globalAlpha = 0.28 * (1 - age / 6.6);
    ctx.fillRect(
      Math.round(x + 10 + age * 0.7 + Math.sin(age * 1.3 + i) * 1.2),
      Math.round(wallTop - 7 - age * 2.2),
      1,
      1,
    );
  }
  ctx.globalAlpha = 1;
}

function drawPath(ctx: CanvasRenderingContext2D, world: World) {
  const startY = world.nearTop(world.cottageX) + 3;
  const doorX = world.cottageX + 9;
  ctx.fillStyle = SCENE_COLORS.path;
  for (let y = startY; y < world.h; y++) {
    const p = (y - startY) / Math.max(1, world.h - startY);
    const center = doorX + (world.w * 0.48 - doorX) * p + Math.sin(p * 3.2) * 4;
    const width = Math.round(1 + p * 7);
    ctx.fillRect(Math.round(center - width / 2), y, width, 1);
  }
}

function drawFence(ctx: CanvasRenderingContext2D, world: World, from: number, to: number) {
  ctx.fillStyle = SCENE_COLORS.fence;
  for (let x = Math.round(world.w * from); x < world.w * to; x++) {
    const ground = world.nearTop(x);
    ctx.fillRect(x, ground - 2, 1, 1);
    if (x % 5 === 0) {
      ctx.fillRect(x, ground - 4, 1, 4);
    }
  }
}

function drawScene(ctx: CanvasRenderingContext2D, world: World, t: number, parallax: number) {
  const { w, h } = world;
  const farShift = Math.round(-parallax * SCENE.parallax.far);
  const midShift = Math.round(-parallax * SCENE.parallax.mid);

  ctx.globalAlpha = 1;
  ctx.drawImage(world.sky, 0, 0);

  for (const star of world.stars) {
    const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * star.speed + star.phase));
    ctx.fillStyle = SCENE_COLORS.star;
    ctx.globalAlpha = alpha;
    ctx.fillRect(star.x, star.y, 1, 1);
    if (star.plus) {
      ctx.globalAlpha = alpha * 0.45;
      ctx.fillRect(star.x - 1, star.y, 1, 1);
      ctx.fillRect(star.x + 1, star.y, 1, 1);
      ctx.fillRect(star.x, star.y - 1, 1, 1);
      ctx.fillRect(star.x, star.y + 1, 1, 1);
    }
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = SCENE_COLORS.star;
  for (const [x, y] of world.moon) {
    ctx.fillRect(x, y, 1, 1);
  }

  for (const cloud of world.clouds) {
    const span = w + cloud.image.width;
    const x = Math.round(((cloud.x0 + cloud.speed * t) % span) - cloud.image.width);
    ctx.drawImage(cloud.image, x, cloud.y);
  }

  ctx.fillStyle = SCENE_COLORS.farHills;
  fillHills(ctx, w, h, world.farTop, t * SCENE.farHillSpeed - farShift);

  ctx.fillStyle = SCENE_COLORS.midHills;
  fillHills(ctx, w, h, world.midTop, -midShift);

  if (world.mode === "hero") {
    const frame = Math.floor((t * 1000) / SCENE.windmillFrameMs) % 4;
    drawWindmill(ctx, world.windmillX + midShift, world.midTop(world.windmillX) + 1, frame);
  }

  ctx.fillStyle = SCENE_COLORS.nearField;
  fillHills(ctx, w, h, world.nearTop, 0);

  if (world.mode === "hero") {
    drawPath(ctx, world);
    drawFence(ctx, world, 0.02, 0.34);
    drawFence(ctx, world, 0.74, 0.99);
    for (const tree of world.trees) {
      drawTree(ctx, tree, world.nearTop(tree.x) + 1, t);
    }
    drawCottage(ctx, world, t);
  }

  ctx.fillStyle = SCENE_COLORS.firefly;
  for (const fly of world.fireflies) {
    const angle = t * fly.speed + fly.phase;
    ctx.globalAlpha = Math.max(0, Math.sin(t * 0.7 + fly.phase * 3));
    ctx.fillRect(
      Math.round(fly.cx + fly.a * Math.sin(angle)),
      Math.round(fly.cy + fly.b * Math.sin(2 * angle)),
      1,
      1,
    );
  }
  ctx.globalAlpha = 1;
}

type Props = {
  mode?: Mode;
  className?: string;
};

export function PixelScene({ mode = "hero", className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const startedAt = performance.now();
    let world: World | null = null;
    let raf = 0;
    let lastFrame = 0;
    let onScreen = true;
    let resizeTimer = 0;
    const mouse = { target: 0, current: 0 };

    const elapsed = () => (performance.now() - startedAt) / 1000;

    const render = (t: number) => {
      if (world !== null) {
        drawScene(ctx, world, t, mouse.current);
      }
    };

    const build = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) {
        return;
      }
      const s = Math.min(SCENE.maxPixel, Math.max(SCENE.minPixel, Math.round(width / SCENE.pixelDivisor)));
      const w = Math.ceil(width / s);
      const h = Math.ceil(height / s);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w * s}px`;
      canvas.style.height = `${h * s}px`;
      ctx.imageSmoothingEnabled = false;
      world = createWorld(w, h, mode);
      render(reduceMotion.matches ? 0 : elapsed());
      canvas.style.opacity = "1";
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - lastFrame < 1000 / SCENE.fps) {
        return;
      }
      lastFrame = now;
      mouse.current += (mouse.target - mouse.current) * 0.08;
      render(elapsed());
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const update = () => {
      const shouldRun = !reduceMotion.matches && !document.hidden && onScreen;
      if (shouldRun && raf === 0) {
        raf = requestAnimationFrame(frame);
      } else if (!shouldRun) {
        stop();
        if (reduceMotion.matches) {
          render(0);
        }
      }
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 150);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (finePointer.matches) {
        mouse.target = (event.clientX / window.innerWidth) * 2 - 1;
      }
    };

    const resizeObserver = new ResizeObserver(onResize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });

    build();
    update();
    resizeObserver.observe(container);
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", update);
    reduceMotion.addEventListener("change", update);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduceMotion.removeEventListener("change", update);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [mode]);

  return (
    <div ref={containerRef} aria-hidden="true" className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute bottom-0 left-0 opacity-0 transition-opacity duration-700 [image-rendering:pixelated]"
      />
    </div>
  );
}
