"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useEffectEvent, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { track } from "@/lib/analytics";
import {
  arrivals,
  FOUR_ZONES_SCRIPT,
  type Move,
  type Step,
  type ZoneName,
} from "@/lib/landing/fourZonesScript";
import { Board } from "./Board";
import { CommitNode } from "./CommitNode";
import { Controls } from "./Controls";
import { FileChip } from "./FileChip";
import { FlyLayer, type Flight, type Rect } from "./FlyLayer";
import { EndCard, StoryText } from "./StoryText";

const SCRIPT = FOUR_ZONES_SCRIPT;
const LAST = SCRIPT.length - 1;
const STEP_MS = 3500;
const LOCK_MS = 1200;
const HIGHLIGHT_MS = 1000;
const STAGGER_S = 0.12;
const TYPE_MS = 30;

type Autoplay = "waiting" | "playing" | "off";

type State = {
  step: number;
  ended: boolean;
  autoplay: Autoplay;
  animated: boolean;
};

type Action =
  | { type: "go"; step: number; animated: boolean }
  | { type: "end" }
  | { type: "autoplay"; value: Autoplay };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "go":
      return { ...state, step: action.step, ended: false, animated: action.animated };
    case "end":
      return { ...state, ended: true };
    case "autoplay":
      return { ...state, autoplay: action.value };
  }
}

type Landing = {
  byId: Map<string, { targetKey: string; kind: Move["kind"] }>;
  remaining: Map<string, number>;
  flash: Step["flash"];
};

const EMPTY = new Set<never>();

function withKey<T>(set: ReadonlySet<T>, key: T): Set<T> {
  return new Set(set).add(key);
}

function withoutKey<T>(set: ReadonlySet<T>, key: T): Set<T> {
  const next = new Set(set);
  next.delete(key);
  return next;
}

function zoneOf(key: string): ZoneName {
  return key.slice(0, key.indexOf(":")) as ZoneName;
}

function useTyped(text: string, run: boolean): string {
  const [count, setCount] = useState(run ? 0 : text.length);

  useEffect(() => {
    if (!run || count >= text.length) {
      return;
    }
    const id = window.setTimeout(() => setCount((c) => c + 1), TYPE_MS);
    return () => window.clearTimeout(id);
  }, [run, count, text.length]);

  return run ? text.slice(0, count) : text;
}

function TypedStory({ step, run }: { step: Step; run: boolean }) {
  const typed = useTyped(step.command ?? "", run);
  return <StoryText step={step} typed={typed} />;
}

function cloneOf(move: Move, item: string, step: Step) {
  if (move.from === "working" || move.from === "staging") {
    return <FileChip as="div" name={item} status="staged" />;
  }
  const commit = step.state[move.from].find((c) => c.hash === item);
  return commit ? <CommitNode as="div" commit={commit} /> : null;
}

export function FourZonesExplainer() {
  const reduced = useReducedMotion() ?? false;
  const [state, dispatch] = useReducer(reducer, { step: 0, ended: false, autoplay: "waiting", animated: false });
  const [hidden, setHidden] = useState<ReadonlySet<string>>(EMPTY);
  const [popping, setPopping] = useState<ReadonlySet<string>>(EMPTY);
  const [highlight, setHighlight] = useState<ReadonlySet<ZoneName>>(EMPTY);
  const [flash, setFlash] = useState<string | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [busy, setBusy] = useState(false);
  const [inView, setInView] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const timers = useRef(new Set<number>());
  const landing = useRef<Landing | null>(null);

  const step = SCRIPT[state.step];

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  };

  const measure = (key: string): Rect | null => {
    const board = boardRef.current;
    const el = board?.querySelector<HTMLElement>(`[data-fly="${key}"]`);
    if (!board || !el) {
      return null;
    }
    const b = board.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) {
      return null;
    }
    return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
  };

  const reveal = (key: string, pop: boolean) => {
    setHidden((h) => withoutKey(h, key));
    if (pop && !reduced) {
      setPopping((p) => withKey(p, key));
      later(() => setPopping((p) => withoutKey(p, key)), 500);
    }
  };

  const startFlash = (info: Step["flash"]) => {
    if (info === undefined) {
      return;
    }
    const key = `working:${info.file}`;
    setFlash(key);
    later(() => setFlash(null), info.ms);
  };

  const resetMotion = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current.clear();
    landing.current = null;
    setFlights([]);
    setHidden(EMPTY);
    setPopping(EMPTY);
    setHighlight(EMPTY);
    setFlash(null);
    setBusy(false);
  };

  const snap = (to: number) => {
    resetMotion();
    dispatch({ type: "go", step: to, animated: false });
  };

  const back = () => {
    if (busy) {
      return;
    }
    if (state.ended) {
      snap(LAST);
    } else if (state.step > 0) {
      snap(state.step - 1);
    }
  };

  const advance = () => {
    if (busy || state.ended) {
      return;
    }
    if (state.step === LAST) {
      dispatch({ type: "end" });
      return;
    }

    const before = SCRIPT[state.step];
    const next = SCRIPT[state.step + 1];
    const incoming = arrivals(before.state, next.state);
    const animate = !reduced;

    const sources = new Map<string, Rect>();
    if (animate) {
      for (const move of next.moves) {
        for (const item of move.items) {
          const key = `${move.from}:${item}`;
          const rect = measure(key);
          if (rect) {
            sources.set(key, rect);
          }
        }
      }
    }

    flushSync(() => {
      setHidden(new Set(incoming));
      setPopping(EMPTY);
      setFlash(null);
      setHighlight(new Set(incoming.map(zoneOf)));
      setBusy(true);
      dispatch({ type: "go", step: state.step + 1, animated: animate });
    });

    later(() => setBusy(false), animate ? LOCK_MS : 200);
    later(() => setHighlight(EMPTY), HIGHLIGHT_MS);

    if (!animate) {
      later(() => setHidden(EMPTY), 16);
      later(() => startFlash(next.flash), 150);
      return;
    }

    const planned: Flight[] = [];
    const info: Landing = { byId: new Map(), remaining: new Map(), flash: next.flash };

    for (const move of next.moves) {
      const mergeTarget = incoming.find((key) => zoneOf(key) === move.to);
      move.items.forEach((item, i) => {
        const sourceKey = `${move.from}:${item}`;
        const targetKey = move.kind === "merge" ? mergeTarget : `${move.to}:${item}`;
        const from = sources.get(sourceKey);
        const to = targetKey ? measure(targetKey) : null;
        const content = cloneOf(move, item, before);
        if (!from || !to || !targetKey || content === null) {
          return;
        }
        const id = `${sourceKey}>${targetKey}`;
        planned.push({ id, kind: move.kind, from, to, delay: i * STAGGER_S, targetKey, content });
        info.byId.set(id, { targetKey, kind: move.kind });
        info.remaining.set(targetKey, (info.remaining.get(targetKey) ?? 0) + 1);
      });
    }

    const landsByFlight = new Set(info.remaining.keys());
    const appearing = incoming.filter((key) => !landsByFlight.has(key));
    later(
      () => appearing.forEach((key) => reveal(key, zoneOf(key) === "local" || zoneOf(key) === "remote")),
      planned.length > 0 ? 0 : 300,
    );

    if (planned.length === 0) {
      later(() => startFlash(next.flash), 300);
      return;
    }

    landing.current = info;
    setFlights(planned);
  };

  const onLand = (id: string) => {
    const info = landing.current;
    const flight = info?.byId.get(id);
    if (!info || !flight) {
      return;
    }
    info.byId.delete(id);
    const left = (info.remaining.get(flight.targetKey) ?? 1) - 1;
    info.remaining.set(flight.targetKey, left);
    if (left === 0) {
      reveal(flight.targetKey, flight.kind === "merge");
    }
    setFlights((list) => list.filter((f) => f.id !== id));
    if (info.byId.size === 0) {
      landing.current = null;
      startFlash(info.flash);
    }
  };

  const replay = () => {
    resetMotion();
    dispatch({ type: "go", step: 0, animated: false });
    if (!reduced) {
      dispatch({ type: "autoplay", value: "playing" });
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (!state.ended && state.step < LAST) {
        snap(state.step + 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      back();
    }
  };

  const tick = useEffectEvent(() => {
    if (state.step < LAST) {
      advance();
    } else {
      dispatch({ type: "end" });
      dispatch({ type: "autoplay", value: "off" });
    }
  });

  useEffect(() => {
    if (state.autoplay !== "playing" || !inView || state.ended) {
      return;
    }
    const id = window.setTimeout(tick, STEP_MS);
    return () => window.clearTimeout(id);
  }, [state.autoplay, inView, state.step, state.ended]);

  useEffect(() => {
    if (state.autoplay !== "playing") {
      return;
    }
    const startedAt = performance.now();
    const stop = (event: Event) => {
      if (event.timeStamp > startedAt) {
        dispatch({ type: "autoplay", value: "off" });
      }
    };
    document.addEventListener("click", stop);
    document.addEventListener("keydown", stop);
    return () => {
      document.removeEventListener("click", stop);
      document.removeEventListener("keydown", stop);
    };
  }, [state.autoplay]);

  const onSeen = useEffectEvent((entry: IntersectionObserverEntry) => {
    setInView(entry.isIntersecting);
    const halfway = entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= window.innerHeight * 0.5;
    if (entry.isIntersecting && halfway && state.autoplay === "waiting" && !reduced) {
      dispatch({ type: "autoplay", value: "playing" });
    }
  });

  useEffect(() => {
    const root = rootRef.current;
    if (root === null) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => onSeen(entry), {
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const finishFlights = useEffectEvent(() => {
    const info = landing.current;
    if (info === null) {
      return;
    }
    landing.current = null;
    setFlights([]);
    setHidden(EMPTY);
    startFlash(info.flash);
  });

  useEffect(() => {
    const onResize = () => finishFlights();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    track("explainer_step_viewed", { step: state.step });
  }, [state.step]);

  useEffect(() => {
    if (state.ended) {
      track("explainer_completed");
    }
  }, [state.ended]);

  return (
    <div ref={rootRef} onKeyDown={onKeyDown} className="flex flex-col gap-8">
      <div className="order-1 lg:order-2">
        {state.ended ? (
          <EndCard onStart={() => track("explainer_cta_clicked")} onReplay={replay} />
        ) : (
          <TypedStory
            key={`${step.id}:${state.animated}`}
            step={step}
            run={state.animated && inView && !reduced}
          />
        )}
      </div>

      <div className="order-2 lg:order-1">
        <Board
          state={step.state}
          activeArrow={state.ended ? null : step.activeArrow}
          hidden={hidden}
          popping={popping}
          highlight={highlight}
          flash={flash}
          boardRef={boardRef}
          overlay={<FlyLayer flights={flights} onLand={onLand} />}
        />
      </div>

      <div className="order-3">
        <Controls
          step={state.step}
          total={SCRIPT.length}
          canBack={state.step > 0 || state.ended}
          canNext={!state.ended}
          onBack={back}
          onNext={advance}
          onDot={snap}
        />
      </div>
    </div>
  );
}
