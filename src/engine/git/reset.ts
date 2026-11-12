import type { CommandResult, Repo } from "../types";
import { isUnborn, resolveRef } from "./helpers";
import { unstage } from "./restore";
import { computeStatus } from "./status";

const MODES = ["--soft", "--mixed", "--hard"] as const;
type Mode = (typeof MODES)[number];

function isMode(arg: string): arg is Mode {
  return (MODES as readonly string[]).includes(arg);
}

export function reset(repo: Repo, args: string[]): CommandResult {
  const option = args.find((arg) => arg.startsWith("-") && !isMode(arg));
  if (option !== undefined) {
    return { repo, output: `git reset: option '${option}' is not supported yet` };
  }

  const mode: Mode = args.find(isMode) ?? "--mixed";
  const rest = args.filter((arg) => !isMode(arg));

  if (rest.length > 1) {
    return { repo, output: "git reset: only one target at a time" };
  }

  if (isUnborn(repo)) {
    return { repo, output: "fatal: Failed to resolve 'HEAD' as a valid ref." };
  }

  const target = rest[0] ?? "HEAD";
  const hash = resolveRef(repo, target);

  if (hash === null) {
    if (mode === "--mixed" && Object.hasOwn(repo.index, target)) {
      return { repo: unstage(repo, [target]), output: "" };
    }
    return {
      repo,
      output: `fatal: ambiguous argument '${target}': unknown revision or path not in the working tree.`,
    };
  }

  const commit = repo.commits[hash];
  const moved = { ...repo, branches: { ...repo.branches, [repo.head]: hash } };

  if (mode === "--soft") {
    return { repo: moved, output: "" };
  }

  if (mode === "--hard") {
    return {
      repo: { ...moved, workingDir: { ...commit.tree }, index: { ...commit.tree } },
      output: `HEAD is now at ${hash} ${commit.message}`,
    };
  }

  const mixed = { ...moved, index: { ...commit.tree } };
  const unstaged = computeStatus(mixed).unstaged;
  const lines =
    unstaged.length === 0
      ? []
      : ["Unstaged changes after reset:", ...unstaged.map((c) => `${c.kind === "deleted" ? "D" : "M"}\t${c.path}`)];

  return { repo: mixed, output: lines.join("\n") };
}
