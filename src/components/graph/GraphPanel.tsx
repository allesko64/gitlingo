"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Repo } from "@/engine/types";
import { buildGraph, type GraphModel } from "@/lib/graph/buildGraph";
import { diffGraph, type GraphDiff } from "@/lib/graph/diffGraph";
import { DETAILS_H, HEADER_H, panelHeight } from "@/lib/graph/layoutConstants";
import { CommitGraph } from "./CommitGraph";

type Shown = { model: GraphModel; diff: GraphDiff | null };

export function GraphPanel({ repo }: { repo: Repo }) {
  const shellRef = useRef<HTMLElement>(null);
  const [panelWidth, setPanelWidth] = useState(1280);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [hoverHash, setHoverHash] = useState<string | null>(null);
  const [pinnedHash, setPinnedHash] = useState<string | null>(null);

  useEffect(() => {
    const el = shellRef.current;
    if (el === null) {
      return;
    }
    const sync = () => {
      setPanelWidth(Math.max(320, el.clientWidth));
      setViewportWidth(window.innerWidth);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  const model = useMemo(
    () => buildGraph(repo, { panelWidth, viewportWidth }),
    [repo, panelWidth, viewportWidth],
  );
  const [shown, setShown] = useState<Shown>({ model, diff: null });

  if (shown.model !== model) {
    setShown({ model, diff: diffGraph(shown.model, model) });
  }

  const headHash = shown.model.headTip;
  const pinnedStillThere =
    pinnedHash !== null && shown.model.nodes.some((node) => node.hash === pinnedHash);
  const activePin = pinnedStillThere ? pinnedHash : null;
  const selectedHash = activePin ?? hoverHash ?? headHash;
  const selected =
    selectedHash === null ? undefined : shown.model.nodes.find((node) => node.hash === selectedHash);
  const isHeadCommit = selected !== undefined && selected.hash === headHash;
  const height = panelHeight(shown.model.laneCount, shown.model.layout);

  return (
    <section
      ref={shellRef}
      aria-labelledby="history-title"
      className="lesson-graph card-surface flex min-h-0 flex-col overflow-hidden rounded-card border border-white/10"
      style={{ height, minHeight: height }}
    >
      <header className="shrink-0 px-4" style={{ height: HEADER_H, paddingTop: 14 }}>
        <h2 id="history-title" className="font-mono text-[11px] tracking-wide text-white/50">
          HISTORY
        </h2>
        <p className="mt-0.5 hidden text-[13px] text-white/50 sm:block">
          Each dot is a save. Lines show what came from what.
        </p>
      </header>

      <CommitGraph
        model={shown.model}
        diff={shown.diff}
        panelWidth={panelWidth}
        selectedHash={selectedHash}
        pinned={activePin !== null}
        onHover={setHoverHash}
        onPin={(hash) => setPinnedHash(hash)}
        onUnpin={() => setPinnedHash(null)}
      />

      <div
        aria-live="polite"
        className="flex shrink-0 items-center gap-3 border-t border-white/8 px-4 text-[13px]"
        style={{ height: DETAILS_H }}
      >
        {shown.model.nodes.length === 0 ? (
          <p className="text-white/50">No commits yet.</p>
        ) : selected !== undefined ? (
          <>
            <span className="shrink-0 font-mono text-[11px] text-white/40">
              {isHeadCommit ? "HEAD COMMIT" : "SELECTED"}
            </span>
            <p className="min-w-0 truncate">
              <span className="font-mono text-white/80">{selected.short}</span>
              <span className="text-white/40">{"  ·  "}</span>
              <span className="text-white">{`"${selected.message}"`}</span>
              <span className="text-white/40">{"  ·  "}</span>
              <span className="text-white/60">{`by ${selected.author}`}</span>
            </p>
          </>
        ) : (
          <p className="text-white/50">No commits yet.</p>
        )}
      </div>
    </section>
  );
}
