"use client";

import { useEffect, useEffectEvent, useRef, useState, type KeyboardEvent } from "react";
import { execute } from "@/engine/execute";
import type { Repo } from "@/engine/types";
import { SyntaxHighlightedText, useInView, useKeySounds } from "../ui/terminal";
import { looksLikeError, toneLines, type Tone } from "./output";

type Line = { id: number; kind: "input" | "output"; text: string };

type Mode = "auto" | "live";

export type CommandEvent = {
  input: string;
  output: string;
  repo: Repo;
  ok: boolean;
  source: "user" | "auto";
};

type Props = {
  variant?: "hero" | "full";
  repo: Repo;
  onRepoChange: (repo: Repo) => void;
  label: string;
  helpText: string;
  welcome?: string;
  filter?: (command: string) => string | null;
  suggest?: (repo: Repo, history: string[]) => string | null;
  onCommand?: (event: CommandEvent) => void;
  outputClassName?: string;
  script?: readonly string[];
  typingSpeed?: number;
  delayBetweenCommands?: number;
  initialDelay?: number;
  enableSound?: boolean;
  takeoverText?: string;
  autoHint?: string;
  onTakeOver?: () => void;
};

const IDLE_MS = 1500;

const TONE: Record<Tone, string> = {
  plain: "text-white/80",
  success: "text-mint/80",
  hint: "text-periwinkle/80",
  warn: "text-sand/80",
};

const TEXT = {
  hero: "text-[13px] sm:text-sm",
  full: "text-sm sm:text-[15px]",
};

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function Terminal({
  variant = "full",
  repo,
  onRepoChange,
  label,
  helpText,
  welcome,
  filter,
  suggest,
  onCommand,
  outputClassName = "h-80",
  script,
  typingSpeed = 45,
  delayBetweenCommands = 1000,
  initialDelay = 500,
  enableSound = true,
  takeoverText,
  autoHint,
  onTakeOver,
}: Props) {
  const nextId = useRef(1);
  const [mode, setMode] = useState<Mode>(() =>
    script !== undefined && script.length > 0 && !prefersReducedMotion() ? "auto" : "live",
  );
  const [autoDone, setAutoDone] = useState(false);
  const [lines, setLines] = useState<Line[]>(() =>
    welcome ? [{ id: 0, kind: "output", text: welcome }] : [],
  );
  const [input, setInput] = useState("");
  const [cursor, setCursor] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const [idle, setIdle] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef(0);
  const repoRef = useRef(repo);

  const inView = useInView(rootRef);
  const { down, up } = useKeySounds(enableSound);

  useEffect(() => {
    repoRef.current = repo;
  }, [repo]);

  const restartIdle = () => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
  };

  useEffect(() => {
    idleTimer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
    return () => window.clearTimeout(idleTimer.current);
  }, []);

  useEffect(() => {
    const output = outputRef.current;
    if (output !== null) {
      output.scrollTop = output.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!focused || viewport === null) {
      return;
    }
    const keepVisible = () => inputRef.current?.scrollIntoView({ block: "nearest" });
    viewport.addEventListener("resize", keepVisible);
    return () => viewport.removeEventListener("resize", keepVisible);
  }, [focused]);

  const makeLine = (kind: Line["kind"], text: string): Line => ({ id: nextId.current++, kind, text });

  const setValue = (value: string) => {
    setInput(value);
    setCursor(value.length);
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(value.length, value.length));
  };

  const runCommand = (raw: string, source: CommandEvent["source"]) => {
    const command = raw.trim();

    if (command === "clear") {
      setLines([]);
      return;
    }

    const echo = makeLine("input", raw);
    if (command === "") {
      setLines((current) => [...current, echo]);
      return;
    }

    if (command === "help") {
      setLines((current) => [...current, echo, makeLine("output", helpText)]);
      return;
    }

    const blocked = filter?.(command) ?? null;
    if (blocked !== null) {
      setLines((current) => [...current, echo, makeLine("output", blocked)]);
      return;
    }

    const result = execute(repoRef.current, command);
    repoRef.current = result.repo;
    onRepoChange(result.repo);
    setLines((current) =>
      result.output === "" ? [...current, echo] : [...current, echo, makeLine("output", result.output)],
    );
    onCommand?.({
      input: command,
      output: result.output,
      repo: result.repo,
      ok: !looksLikeError(result.output),
      source,
    });
  };

  const showTyped = useEffectEvent((text: string) => {
    setInput(text);
    setCursor(text.length);
  });

  const runScripted = useEffectEvent((command: string) => {
    setInput("");
    setCursor(0);
    runCommand(command, "auto");
  });

  const finishScript = useEffectEvent(() => {
    setAutoDone(true);
    restartIdle();
  });

  useEffect(() => {
    if (mode !== "auto" || !inView || script === undefined) {
      return;
    }

    let cancelled = false;

    const play = async () => {
      await wait(initialDelay);
      for (const command of script) {
        for (let i = 0; i < command.length; i++) {
          if (cancelled) return;
          down(command[i]);
          await wait(typingSpeed + Math.random() * 30);
          if (cancelled) return;
          up(command[i]);
          showTyped(command.slice(0, i + 1));
        }
        down("Enter");
        await wait(80);
        if (cancelled) return;
        up("Enter");
        runScripted(command);
        await wait(delayBetweenCommands);
      }
      if (!cancelled) {
        finishScript();
      }
    };

    void play();
    return () => {
      cancelled = true;
    };
  }, [mode, inView, script, initialDelay, typingSpeed, delayBetweenCommands, down, up]);

  const takeOver = () => {
    if (mode !== "auto") {
      return;
    }
    setMode("live");
    setAutoDone(false);
    setValue("");
    setHistory([]);
    setHistoryIndex(null);
    setLines(takeoverText ? [makeLine("output", takeoverText)] : []);
    onTakeOver?.();
    restartIdle();
  };

  const submit = () => {
    const raw = input;
    const command = raw.trim();
    setValue("");
    setHistoryIndex(null);
    restartIdle();
    if (command !== "") {
      setHistory((h) => [...h, command]);
    }
    runCommand(raw, "user");
  };

  const recall = (direction: -1 | 1) => {
    if (history.length === 0) {
      return;
    }
    const start = historyIndex ?? history.length;
    const next = Math.min(history.length, Math.max(0, start + direction));
    setHistoryIndex(next === history.length ? null : next);
    setValue(next === history.length ? "" : history[next]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    down(event.key);
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      recall(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      recall(1);
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      setLines([]);
    }
  };

  const hintText = mode === "live" ? (suggest?.(repo, history) ?? null) : autoDone ? (autoHint ?? null) : null;
  const showHint = input === "" && idle && hintText !== null;
  const showCaret = focused || mode === "auto";

  return (
    <div
      ref={rootRef}
      className={`font-mono ${TEXT[variant]}`}
      onPointerDown={takeOver}
      onClick={() => {
        if (window.getSelection()?.toString() === "") {
          inputRef.current?.focus();
        }
      }}
    >
      <div
        ref={outputRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        className={`${outputClassName} no-visible-scrollbar overflow-y-auto px-4 pt-3 leading-relaxed`}
      >
        {lines.map((line) =>
          line.kind === "input" ? (
            <p key={line.id} className="whitespace-pre-wrap">
              <span aria-hidden="true" className="text-white">
                ${" "}
              </span>
              <SyntaxHighlightedText text={line.text} />
            </p>
          ) : (
            <p key={line.id} className="whitespace-pre-wrap">
              {toneLines(line.text).map((part, i) => (
                <span key={i} className={`block ${TONE[part.tone]}`}>
                  {part.text === "" ? "\u00a0" : part.text}
                </span>
              ))}
            </p>
          ),
        )}
      </div>

      <div className="flex h-11 items-center gap-2 px-4 text-base sm:text-sm">
        <span aria-hidden="true" className="text-white">
          $
        </span>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setCursor(event.target.selectionStart ?? event.target.value.length);
              restartIdle();
            }}
            onSelect={(event) => setCursor(event.currentTarget.selectionStart ?? input.length)}
            onKeyDown={onKeyDown}
            onKeyUp={(event) => up(event.key)}
            onFocus={() => {
              takeOver();
              setFocused(true);
            }}
            onBlur={() => setFocused(false)}
            aria-label={label}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            data-ring="parent"
            className="w-full scroll-mb-6 bg-transparent text-white caret-transparent outline-none"
          />
          {showCaret && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 h-[1.15em] w-[1ch] -translate-y-1/2 animate-blink bg-white motion-reduce:animate-none"
              style={{ left: `${cursor}ch` }}
            />
          )}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 left-[1.5ch] -translate-y-1/2 whitespace-nowrap text-white/50 transition-opacity duration-500 ${
              showHint ? "opacity-100" : "opacity-0"
            }`}
          >
            {mode === "live" ? `try: ${hintText}` : hintText}
          </span>
        </div>
      </div>
    </div>
  );
}
