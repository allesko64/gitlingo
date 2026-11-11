"use client";

import { useEffect, useState } from "react";
import { copy } from "@/lib/landing/copy";
import { cn } from "@/lib/utils";

const REFRESH_MS = 30_000;

export function LearnerCounter() {
  const [learners, setLearners] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/stats", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const data: { learners?: unknown } = await response.json();
        if (active && typeof data.learners === "number") {
          setLearners(data.learners);
        }
      } catch {
        // Keep showing the last number.
      }
    };

    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, REFRESH_MS);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <p
      aria-live="polite"
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-ui border border-white/10 bg-navy/40 px-3 text-sm text-white/80 transition-opacity duration-300 motion-reduce:transition-none",
        learners === null ? "opacity-0" : "opacity-100",
      )}
    >
      <span aria-hidden="true" className="relative flex size-2">
        <span className="absolute inline-flex size-full rounded-full bg-mint opacity-75 motion-safe:animate-ping" />
        <span className="relative inline-flex size-2 rounded-full bg-mint" />
      </span>
      <span>
        <span className="font-mono font-medium tabular-nums text-white">{learners?.toLocaleString("en-US") ?? "100"}</span>{" "}
        {copy.hero.learnersLabel}
      </span>
    </p>
  );
}
