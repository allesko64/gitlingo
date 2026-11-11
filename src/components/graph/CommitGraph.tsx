"use client";

import { LayoutGroup } from "motion/react";
import { memo, useEffect, useRef, type CSSProperties } from "react";
import {
  type GEdge,
  type GNode,
  type GraphModel,
  laneColor,
} from "@/lib/graph/buildGraph";
import type { GraphDiff } from "@/lib/graph/diffGraph";
import {
  EDGE_STROKE,
  GUIDE_FADE,
  REF_PILL_HEIGHT,
} from "@/lib/graph/layoutConstants";
import { cn } from "@/lib/utils";
import { RefPill } from "./RefPill";

type Props = {
  model: GraphModel;
  diff: GraphDiff | null;
  compact?: boolean;
  className?: string;
  panelWidth: number;
  selectedHash: string | null;
  pinned: boolean;
  onHover: (hash: string | null) => void;
  onPin: (hash: string) => void;
  onUnpin: () => void;
};

const SLIDE = "transition-transform duration-[400ms] ease-out motion-reduce:transition-none";
const POP = "motion-safe:animate-node-pop motion-reduce:animate-fade-quick";
const DRAW_MS = 450;
const NONE: ReadonlySet<string> = new Set();

function at(x: number, y: number): CSSProperties {
  return { transform: `translate(${x}px, ${y}px)` };
}

const Edge = memo(function Edge({ edge, animate }: { edge: GEdge; animate: boolean }) {
  return (
    <path
      d={edge.path}
      pathLength={1}
      fill="none"
      stroke={laneColor(edge.lane)}
      strokeOpacity={edge.lane === 0 ? 0.7 : 0.6}
      strokeWidth={EDGE_STROKE}
      strokeLinecap="round"
      strokeDasharray={animate ? 1 : undefined}
      className={animate ? "motion-safe:animate-draw motion-reduce:animate-fade-quick" : undefined}
    />
  );
});

const Node = memo(function Node({
  node,
  animate,
  delay,
  compact,
  radius,
  selected,
}: {
  node: GNode;
  animate: boolean;
  delay: number;
  compact: boolean;
  radius: number;
  selected: boolean;
}) {
  const color = laneColor(node.lane);
  return (
    <g style={at(node.x, node.y)} className={SLIDE}>
      <g className={animate ? POP : undefined} style={{ animationDelay: `${delay}ms`, transformOrigin: "0px 0px" }}>
        <circle
          r={radius}
          className="fill-white"
          stroke={node.lane === 0 ? undefined : color}
          strokeWidth={node.lane === 0 ? undefined : 3}
        />
        {!compact && (
          <text
            y={radius + 14 + 10}
            textAnchor="middle"
            stroke="var(--color-navy)"
            strokeWidth={3}
            paintOrder="stroke"
            className={cn("fill-white/75 font-mono text-[12px]", selected && "fill-white")}
          >
            {node.short}
          </text>
        )}
      </g>
    </g>
  );
});

export function CommitGraph({
  model,
  diff,
  compact = false,
  className,
  panelWidth,
  selectedHash,
  pinned,
  onHover,
  onPin,
  onUnpin,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const { layout } = model;

  const addedNodes = diff ? new Set(diff.addedNodes) : NONE;
  const addedEdges = diff ? new Set(diff.addedEdges) : NONE;
  const addedLabels = diff ? new Set(diff.addedLabels) : NONE;
  const drawnInto = new Set(model.edges.filter((edge) => addedEdges.has(edge.id)).map((edge) => edge.to));

  const latest = model.nodes.find((node) => node.isLatest);
  const headNode = model.nodes.find((node) => node.hash === model.headTip);
  const height = Math.max(model.height, compact ? 0 : 120);
  const guideWidth = Math.max(model.width, panelWidth);

  useEffect(() => {
    const box = scrollRef.current;
    if (box === null) {
      return;
    }
    const target = Math.max(0, (latest?.x ?? 0) + layout.rightSpace - box.clientWidth);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ left: target, behavior: mounted.current && !reduce ? "smooth" : "auto" });
    mounted.current = true;
  }, [model, latest?.x, layout.rightSpace]);

  if (!model.initialized) {
    return <p className="px-4 pb-4 text-sm text-white/50">Not a repository yet. Run git init.</p>;
  }

  return (
    <div
      ref={scrollRef}
      className={cn("no-visible-scrollbar relative min-h-0 flex-1 overflow-auto", className)}
      onClick={(event) => {
        if (event.target === event.currentTarget || (event.target as HTMLElement).dataset.graphBg === "1") {
          onUnpin();
        }
      }}
    >
      <div className="flex min-h-full items-center">
        <div className="relative" style={{ width: Math.max(model.width, guideWidth), height }} data-graph-bg="1">
          <svg
            role="img"
            aria-label={model.summary}
            width={Math.max(model.width, guideWidth)}
            height={height}
            viewBox={`0 0 ${Math.max(model.width, guideWidth)} ${height}`}
            className="block overflow-visible"
            data-graph-bg="1"
          >
            <defs>
              {Array.from({ length: model.laneCount }, (_, lane) => {
                const color = lane === 0 ? "rgba(255,255,255,0.08)" : withAlpha(laneColor(lane), 0.1);
                return (
                  <linearGradient key={`guide-${lane}`} id={`lane-guide-${lane}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor={color} />
                    <stop
                      offset={`${Math.max(0, ((guideWidth - GUIDE_FADE) / guideWidth) * 100)}%`}
                      stopColor={color}
                    />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>

            {Array.from({ length: model.laneCount }, (_, lane) => (
              <line
                key={lane}
                x1={0}
                x2={Math.max(model.width, guideWidth)}
                y1={layout.padY + lane * layout.laneStep}
                y2={layout.padY + lane * layout.laneStep}
                stroke={`url(#lane-guide-${lane})`}
                strokeWidth={1}
              />
            ))}

            {model.laneCount > 0 && (
              <text
                x={Math.max(model.width, guideWidth) - 12}
                y={layout.padY - 10}
                textAnchor="end"
                className="fill-white/35 font-mono text-[11px]"
              >
                newer →
              </text>
            )}

            {model.edges.map((edge) => (
              <Edge key={edge.id} edge={edge} animate={addedEdges.has(edge.id)} />
            ))}

            {model.labels.map(
              (label) =>
                label.stem !== null && (
                  <path
                    key={`stem-${label.name}`}
                    d={label.stem}
                    pathLength={1}
                    fill="none"
                    stroke={label.color}
                    strokeOpacity={0.6}
                    strokeWidth={EDGE_STROKE}
                    strokeLinecap="round"
                    strokeDasharray={addedLabels.has(label.name) ? 1 : undefined}
                    className={
                      addedLabels.has(label.name)
                        ? "motion-safe:animate-draw motion-reduce:animate-fade-quick"
                        : undefined
                    }
                  />
                ),
            )}

            {model.nodes.length === 0 && (
              <circle
                cx={layout.padX}
                cy={layout.padY}
                r={layout.nodeRadius}
                fill="none"
                strokeDasharray="3 3"
                className="stroke-white/50"
              />
            )}

            {model.nodes.map((node) => (
              <Node
                key={node.hash}
                node={node}
                compact={compact}
                radius={layout.nodeRadius}
                selected={selectedHash === node.hash}
                animate={addedNodes.has(node.hash)}
                delay={drawnInto.has(node.hash) ? DRAW_MS : 0}
              />
            ))}

            {headNode !== undefined && (
              <g style={at(headNode.x, headNode.y)} className={SLIDE}>
                <circle
                  r={layout.headRingRadius}
                  fill="none"
                  strokeWidth={2}
                  className="stroke-white"
                  strokeOpacity={0.9}
                />
              </g>
            )}
          </svg>

          <LayoutGroup>
            {model.labels.map((label) => (
              <RefPill key={label.name} label={label} animate={addedLabels.has(label.name)} />
            ))}
          </LayoutGroup>

          {model.nodes.length === 0 && model.labels[0] !== undefined && (
            <p
              className="pointer-events-none absolute text-[13px] text-white/50"
              style={{
                left: model.labels[0].x + model.labels[0].width + 12,
                top: layout.padY - REF_PILL_HEIGHT / 2,
                lineHeight: `${REF_PILL_HEIGHT}px`,
              }}
            >
              No commits yet. Your history grows here.
            </p>
          )}

          {!compact &&
            model.nodes.map((node) => (
              <button
                key={node.hash}
                type="button"
                aria-label={`Commit ${node.short}: ${node.message}`}
                aria-pressed={pinned && selectedHash === node.hash}
                onMouseEnter={() => onHover(node.hash)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(node.hash)}
                onBlur={() => onHover(null)}
                onClick={(event) => {
                  event.stopPropagation();
                  onPin(node.hash);
                }}
                className="absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-[8px]"
                style={{ left: node.x, top: node.y }}
              />
            ))}
        </div>
      </div>

      <ul className="sr-only">
        {model.nodes.map((node) => (
          <li key={node.hash}>{`Commit ${node.short}: ${node.message}`}</li>
        ))}
        {model.labels.map((label) => (
          <li key={label.name}>
            {`Branch ${label.name}${label.isCurrent ? " (HEAD)" : ""}${label.tip ? ` at ${label.tip}` : ", no commits yet"}`}
          </li>
        ))}
      </ul>
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
