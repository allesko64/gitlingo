"use client";

import dynamic from "next/dynamic";
import { FourZonesSkeleton } from "./FourZonesSkeleton";

export const LazyFourZones = dynamic(
  () => import("./FourZonesExplainer").then((module) => module.FourZonesExplainer),
  { ssr: false, loading: () => <FourZonesSkeleton /> },
);
