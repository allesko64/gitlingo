import type { CommandResult, FilePath, FileTree, Repo } from "../types";
import { fileIn, headTree } from "./helpers";

function copyFrom(source: FileTree, target: FileTree, paths: FilePath[]): FileTree {
  const next = { ...target };

  for (const path of paths) {
    const content = fileIn(source, path);
    if (content === undefined) {
      delete next[path];
    } else {
      next[path] = content;
    }
  }

  return next;
}

export function unstage(repo: Repo, paths: FilePath[]): Repo {
  return { ...repo, index: copyFrom(headTree(repo), repo.index, paths) };
}

export function restore(repo: Repo, args: string[]): CommandResult {
  const staged = args[0] === "--staged";
  const paths = staged ? args.slice(1) : args;

  const option = paths.find((arg) => arg.startsWith("-"));
  if (option !== undefined) {
    return { repo, output: `git restore: option '${option}' is not supported yet` };
  }
  if (paths.length === 0) {
    return { repo, output: "fatal: you must specify path(s) to restore" };
  }

  const known = staged ? { ...headTree(repo), ...repo.index } : repo.index;
  for (const path of paths) {
    if (fileIn(known, path) === undefined) {
      return {
        repo,
        output: `error: pathspec '${path}' did not match any file(s) known to git`,
      };
    }
  }

  if (staged) {
    return { repo: unstage(repo, paths), output: "" };
  }

  return { repo: { ...repo, workingDir: copyFrom(repo.index, repo.workingDir, paths) }, output: "" };
}
