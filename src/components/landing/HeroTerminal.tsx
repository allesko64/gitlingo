"use client";

import Link from "next/link";
import { useState } from "react";
import { copy, FIRST_LEVEL_HREF } from "@/lib/landing/copy";
import { Terminal } from "../terminal/Terminal";
import { TerminalChrome } from "../terminal/TerminalChrome";
import { ZoneStrip } from "../terminal/ZoneStrip";
import { fileZone } from "../terminal/zones";
import { HERO_SCRIPT, heroFilter, heroStartRepo, heroSuggestion } from "./heroCommands";
import { HERO_OUTPUT_HEIGHT } from "./HeroTerminalSkeleton";

export function HeroTerminal() {
  const [repo, setRepo] = useState(heroStartRepo);
  const [succeeded, setSucceeded] = useState(false);

  return (
    <div>
      <TerminalChrome title={copy.terminal.title}>
        <Terminal
          variant="hero"
          repo={repo}
          onRepoChange={setRepo}
          label={copy.terminal.label}
          helpText={copy.terminal.help}
          welcome={copy.terminal.welcome}
          filter={heroFilter}
          suggest={heroSuggestion}
          script={HERO_SCRIPT}
          typingSpeed={45}
          delayBetweenCommands={1000}
          takeoverText={copy.terminal.takeover}
          autoHint={copy.terminal.autoHint}
          onTakeOver={() => {
            setRepo(heroStartRepo());
            setSucceeded(false);
          }}
          onCommand={(event) => {
            if (event.ok && event.source === "user") {
              setSucceeded(true);
            }
          }}
          outputClassName={HERO_OUTPUT_HEIGHT}
        />
        <ZoneStrip zone={fileZone(repo, copy.terminal.fileName)} fileName={copy.terminal.fileName} />
      </TerminalChrome>

      <p className="mt-3 h-6 text-sm">
        {succeeded && (
          <Link
            href={FIRST_LEVEL_HREF}
            className="rounded text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            {copy.hero.afterFirstCommand} →
          </Link>
        )}
      </p>
    </div>
  );
}
