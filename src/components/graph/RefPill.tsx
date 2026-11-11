"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";
import type { GLabel } from "@/lib/graph/buildGraph";
import {
  HEAD_SEG_WIDTH,
  PILL_DIVIDER,
  REF_PILL_HEIGHT,
  REF_PILL_RADIUS,
  branchPillWidth,
} from "@/lib/graph/layoutConstants";
import { cn } from "@/lib/utils";

type Props = {
  label: GLabel;
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function RefPill({ label, animate = false, className, style }: Props) {
  const branchW = branchPillWidth(label.name);
  const fill = withAlpha(label.color, 0.14);
  const border = withAlpha(label.color, 0.5);

  return (
    <div
      className={cn(
        "absolute flex -translate-y-1/2 items-stretch overflow-hidden",
        animate && "motion-safe:animate-node-pop motion-reduce:animate-fade-quick",
        className,
      )}
      style={{
        left: label.x,
        top: label.y,
        height: REF_PILL_HEIGHT,
        borderRadius: REF_PILL_RADIUS,
        ...style,
      }}
    >
      {label.isCurrent && (
        <motion.div
          layoutId="head"
          className="flex shrink-0 items-center justify-center bg-white font-mono text-[12px] font-semibold text-navy"
          style={{ width: HEAD_SEG_WIDTH, height: REF_PILL_HEIGHT }}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        >
          HEAD
        </motion.div>
      )}
      {label.isCurrent && (
        <div
          aria-hidden="true"
          className="relative flex shrink-0 items-center justify-center border-y font-mono text-[12px] text-white/55"
          style={{
            width: PILL_DIVIDER,
            height: REF_PILL_HEIGHT,
            backgroundColor: fill,
            borderColor: border,
          }}
        >
          <span className="absolute inset-y-1.5 left-0 w-px bg-white/30" />
          ›
        </div>
      )}
      <div
        className="flex items-center justify-center px-2.5 text-[13px] text-white"
        style={{
          minWidth: branchW,
          height: REF_PILL_HEIGHT,
          backgroundColor: fill,
          border: `1px solid ${border}`,
          borderLeft: label.isCurrent ? "none" : undefined,
          borderTopLeftRadius: label.isCurrent ? 0 : REF_PILL_RADIUS,
          borderBottomLeftRadius: label.isCurrent ? 0 : REF_PILL_RADIUS,
          borderTopRightRadius: REF_PILL_RADIUS,
          borderBottomRightRadius: REF_PILL_RADIUS,
        }}
      >
        {label.name}
      </div>
    </div>
  );
}

function withAlpha(hex: string, alpha: number): string {
  if (hex === "#ffffff") {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  const raw = hex.replace("#", "");
  const n = Number.parseInt(raw, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
