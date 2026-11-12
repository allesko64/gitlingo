import type { CommandResult, Repo } from "../types";
import { isUnborn, makeCommit } from "./helpers";
import { computeStatus, status } from "./status";

const ONLY_M = 'git commit: only git commit -m "message" is supported';

function readMessage(repo: Repo, args: string[]): { message: string } | CommandResult {
  if (args.length === 0) {
    return { repo, output: `${ONLY_M} (the text editor is not available here)` };
  }
  if (args[0] !== "-m") {
    return { repo, output: ONLY_M };
  }
  if (args.length === 1) {
    return { repo, output: "error: switch `m' requires a value" };
  }
  if (args.length > 2) {
    return {
      repo,
      output: [
        `error: pathspec '${args[2]}' did not match any file(s) known to git`,
        `hint: put the message in quotes: git commit -m "${args.slice(1).join(" ")}"`,
      ].join("\n"),
    };
  }
  return { message: args[1] };
}

function amend(repo: Repo, args: string[]): CommandResult {
  if (isUnborn(repo)) {
    return { repo, output: "fatal: You have nothing to amend." };
  }
  if (args.length === 0) {
    return {
      repo,
      output: 'git commit --amend: the text editor is not available here. Give the new message with -m: git commit --amend -m "message"',
    };
  }

  const read = readMessage(repo, args);
  if (!("message" in read)) {
    return read;
  }

  const old = repo.commits[repo.branches[repo.head]];
  const replacement = makeCommit(repo, read.message, old.parents, { ...repo.index });
  const files = computeStatus(repo).staged.length;
  const label = old.parents.length === 0 ? `${repo.head} (root-commit)` : repo.head;

  return {
    repo: {
      ...repo,
      commits: { ...repo.commits, [replacement.hash]: replacement },
      branches: { ...repo.branches, [repo.head]: replacement.hash },
    },
    output: `[${label} ${replacement.hash}] ${read.message}\n ${files === 1 ? "1 file changed" : `${files} files changed`}`,
  };
}

export function commit(repo: Repo, args: string[]): CommandResult {
  if (args[0] === "--amend") {
    return amend(repo, args.slice(1));
  }

  const read = readMessage(repo, args);
  if (!("message" in read)) {
    return read;
  }

  const staged = computeStatus(repo).staged;
  if (staged.length === 0) {
    return status(repo, []);
  }

  const { message } = read;
  const parents = isUnborn(repo) ? [] : [repo.branches[repo.head]];
  const newCommit = makeCommit(repo, message, parents, { ...repo.index });
  const { hash } = newCommit;

  const label = parents.length === 0 ? `${repo.head} (root-commit)` : repo.head;
  const files = staged.length === 1 ? "1 file changed" : `${staged.length} files changed`;

  return {
    repo: {
      ...repo,
      commits: { ...repo.commits, [hash]: newCommit },
      branches: { ...repo.branches, [repo.head]: hash },
    },
    output: `[${label} ${hash}] ${message}\n ${files}`,
  };
}
