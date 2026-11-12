import type { CommandResult, Repo } from "../types";
import { headTree, isUnborn } from "./helpers";
import { computeStatus } from "./status";

function save(repo: Repo): CommandResult {
  if (isUnborn(repo)) {
    return { repo, output: "fatal: You do not have the initial commit yet" };
  }

  const { staged, unstaged } = computeStatus(repo);
  if (staged.length === 0 && unstaged.length === 0) {
    return { repo, output: "No local changes to save" };
  }

  const head = repo.commits[repo.branches[repo.head]];
  const message = `WIP on ${repo.head}: ${head.hash} ${head.message}`;
  const clean = headTree(repo);

  const untracked = Object.fromEntries(
    Object.entries(repo.workingDir).filter(([path]) => !Object.hasOwn(repo.index, path)),
  );
  const workingDir = { ...untracked, ...clean };

  return {
    repo: {
      ...repo,
      stash: [{ message, workingDir: { ...repo.workingDir }, index: { ...repo.index } }, ...repo.stash],
      workingDir,
      index: { ...clean },
    },
    output: `Saved working directory and index state ${message}`,
  };
}

function list(repo: Repo): CommandResult {
  return {
    repo,
    output: repo.stash.map((entry, i) => `stash@{${i}}: ${entry.message}`).join("\n"),
  };
}

function pop(repo: Repo): CommandResult {
  const [top, ...rest] = repo.stash;
  if (top === undefined) {
    return { repo, output: "No stash entries found." };
  }

  const { staged, unstaged } = computeStatus(repo);
  if (staged.length > 0 || unstaged.length > 0) {
    return {
      repo,
      output: "error: Your local changes would be overwritten by the stash.\nPlease commit or stash them first.\nAborting",
    };
  }

  const restored = { ...repo, workingDir: top.workingDir, index: top.index, stash: rest };
  const { staged: s, unstaged: u } = computeStatus(restored);
  const lines = [`On branch ${repo.head}`];
  if (s.length > 0) {
    lines.push("Changes to be committed:", ...s.map((c) => `  ${`${c.kind}:`.padEnd(12)}${c.path}`));
  }
  if (u.length > 0) {
    lines.push("Changes not staged for commit:", ...u.map((c) => `  ${`${c.kind}:`.padEnd(12)}${c.path}`));
  }
  lines.push(`Dropped stash@{0} (${top.message})`);

  return { repo: restored, output: lines.join("\n") };
}

export function stash(repo: Repo, args: string[]): CommandResult {
  const [sub, ...rest] = args;

  if (sub === undefined || sub === "push") {
    return save(repo);
  }
  if (rest.length > 0) {
    return { repo, output: `git stash ${sub}: arguments are not supported yet` };
  }
  if (sub === "list") {
    return list(repo);
  }
  if (sub === "pop") {
    return pop(repo);
  }
  if (sub.startsWith("-")) {
    return { repo, output: `git stash: option '${sub}' is not supported yet` };
  }

  return { repo, output: `git stash: '${sub}' is not a stash command (try push, pop or list)` };
}
