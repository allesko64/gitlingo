import type { CommandResult, FilePath, FileTree, Repo } from "../types";
import { allPaths, fileIn, headTree } from "./helpers";

function splitLines(content: string | undefined): string[] {
  return content === undefined || content === "" ? [] : content.split("\n");
}

function diffLines(before: string[], after: string[]): string[] {
  const lcs: number[][] = Array.from({ length: before.length + 1 }, () =>
    new Array<number>(after.length + 1).fill(0),
  );

  for (let i = before.length - 1; i >= 0; i--) {
    for (let j = after.length - 1; j >= 0; j--) {
      lcs[i][j] =
        before[i] === after[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const lines: string[] = [];
  let i = 0;
  let j = 0;

  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      lines.push(` ${before[i]}`);
      i++;
      j++;
    } else if (i < before.length && (j >= after.length || lcs[i + 1][j] >= lcs[i][j + 1])) {
      lines.push(`-${before[i]}`);
      i++;
    } else {
      lines.push(`+${after[j]}`);
      j++;
    }
  }

  return lines;
}

function diffFile(path: FilePath, before: string | undefined, after: string | undefined): string[] {
  const header = [`diff --git a/${path} b/${path}`];

  if (before === undefined) {
    header.push("new file mode 100644");
  } else if (after === undefined) {
    header.push("deleted file mode 100644");
  }

  header.push(before === undefined ? "--- /dev/null" : `--- a/${path}`);
  header.push(after === undefined ? "+++ /dev/null" : `+++ b/${path}`);

  return [...header, ...diffLines(splitLines(before), splitLines(after))];
}

export function diffTrees(before: FileTree, after: FileTree): string {
  return allPaths(before, after)
    .filter((path) => fileIn(before, path) !== fileIn(after, path))
    .flatMap((path) => diffFile(path, fileIn(before, path), fileIn(after, path)))
    .join("\n");
}

export function diff(repo: Repo, args: string[]): CommandResult {
  if (args.length === 0) {
    return { repo, output: diffTrees(repo.index, repo.workingDir) };
  }

  if (args.length === 1 && (args[0] === "--staged" || args[0] === "--cached")) {
    return { repo, output: diffTrees(headTree(repo), repo.index) };
  }

  const option = args.find((arg) => arg.startsWith("-")) ?? args[0];
  return { repo, output: `git diff: option '${option}' is not supported yet` };
}
