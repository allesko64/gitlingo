"use client";

import { domAnimation, LazyMotion, m } from "motion/react";
import type { ReactNode } from "react";

export type Rect = { x: number; y: number; w: number; h: number };

export type Flight = {
  id: string;
  kind: "copy" | "merge";
  from: Rect;
  to: Rect;
  delay: number;
  targetKey: string;
  content: ReactNode;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function FlyLayer({ flights, onLand }: { flights: Flight[]; onLand: (id: string) => void }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
        {flights.map((flight) => {
          const merge = flight.kind === "merge";
          const x = merge ? flight.to.x + flight.to.w / 2 - flight.from.w / 2 : flight.to.x;
          const y = merge ? flight.to.y + flight.to.h / 2 - flight.from.h / 2 : flight.to.y;

          return (
            <m.div
              key={flight.id}
              className="absolute top-0 left-0"
              style={{ width: flight.from.w, height: flight.from.h }}
              initial={{ x: flight.from.x, y: flight.from.y, scale: 1, opacity: 1 }}
              animate={{ x, y, scale: merge ? 0.4 : 1, opacity: merge ? [1, 1, 0] : 1 }}
              transition={{
                duration: 0.8,
                ease: EASE,
                delay: flight.delay,
                opacity: { duration: 0.8, delay: flight.delay, times: [0, 0.6, 1] },
              }}
              onAnimationComplete={() => onLand(flight.id)}
            >
              {flight.content}
            </m.div>
          );
        })}
      </div>
    </LazyMotion>
  );
}
