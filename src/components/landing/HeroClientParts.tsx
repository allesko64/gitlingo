"use client";

import dynamic from "next/dynamic";
import { HeroTerminalSkeleton } from "./HeroTerminalSkeleton";

export const LazyPixelScene = dynamic(
  () => import("./PixelScene").then((module) => module.PixelScene),
  { ssr: false },
);

export const LazyHeroTerminal = dynamic(
  () => import("./HeroTerminal").then((module) => module.HeroTerminal),
  { ssr: false, loading: () => <HeroTerminalSkeleton /> },
);
