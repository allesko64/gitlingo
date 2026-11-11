import type { ParsedCommand } from "./parse";
import type { CommandResult, Repo } from "./types";

export type ShellCommand = (repo: Repo, command: ParsedCommand) => CommandResult;

function hasFile(repo: Repo, path: string): boolean {
  return Object.hasOwn(repo.workingDir, path);
}

function writeFile(repo: Repo, path: string, content: string): Repo {
  return {
    ...repo,
    workingDir: { ...repo.workingDir, [path]: content },
  };
}

function touch(repo: Repo, { args }: ParsedCommand): CommandResult {
  if (args.length === 0) {
    return { repo, output: "touch: missing file operand" };
  }

  let next = repo;
  for (const path of args) {
    if (!hasFile(next, path)) {
      next = writeFile(next, path, "");
    }
  }

  return { repo: next, output: "" };
}

function echo(repo: Repo, { args, redirect }: ParsedCommand): CommandResult {
  const text = args.join(" ");

  if (redirect === null) {
    return { repo, output: text };
  }

  return { repo: writeFile(repo, redirect, text), output: "" };
}

function ls(repo: Repo, { args }: ParsedCommand): CommandResult {
  if (args.length > 0) {
    return { repo, output: "ls: arguments are not supported yet" };
  }

  const names = Object.keys(repo.workingDir).sort();
  return { repo, output: names.join("  ") };
}

function cat(repo: Repo, { args }: ParsedCommand): CommandResult {
  if (args.length === 0) {
    return { repo, output: "cat: missing file operand" };
  }

  const lines = args.map((path) =>
    hasFile(repo, path) ? repo.workingDir[path] : `cat: ${path}: No such file or directory`,
  );

  return { repo, output: lines.join("\n") };
}

export const shellCommands: Record<string, ShellCommand> = { touch, echo, ls, cat };
