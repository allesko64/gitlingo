import type { CommandResult, FileTree, Repo } from "../types";
import { fileIn, headTree, moveFiles } from "./helpers";
import { computeStatus } from "./status";

export function findBlockers(repo: Repo, to: FileTree, action: string): string | null {
  const from = headTree(repo);
  const { staged, unstaged, untracked } = computeStatus(repo);
  const advice = action === "merge" ? "before you merge." : "before you switch branches.";

  const changed = [...new Set([...staged, ...unstaged].map((change) => change.path))]
    .filter((path) => fileIn(from, path) !== fileIn(to, path))
    .sort();

  if (changed.length > 0) {
    return [
      `error: Your local changes to the following files would be overwritten by ${action}:`,
      ...changed.map((path) => `  ${path}`),
      `Please commit your changes ${advice}`,
      "Aborting",
    ].join("\n");
  }

  const overwritten = untracked.filter((path) => fileIn(to, path) !== undefined);

  if (overwritten.length > 0) {
    return [
      `error: The following untracked working tree files would be overwritten by ${action}:`,
      ...overwritten.map((path) => `  ${path}`),
      `Please move or remove them ${advice}`,
      "Aborting",
    ].join("\n");
  }

  return null;
}

function changeBranch(action: "switch" | "checkout") {
  return (repo: Repo, args: string[]): CommandResult => {
    if (args.length === 0) {
      return { repo, output: `fatal: missing branch name (try: git ${action} main)` };
    }
    if (args[0] === "-c" || args[0] === "-b") {
      return {
        repo,
        output: `git ${action}: ${args[0]} is not supported yet. Create the branch first with git branch <name>, then run git ${action} <name>`,
      };
    }
    if (args[0].startsWith("-")) {
      return { repo, output: `git ${action}: option '${args[0]}' is not supported yet` };
    }
    if (args.length > 1) {
      return { repo, output: `git ${action}: only one branch name at a time` };
    }

    const name = args[0];

    if (!Object.hasOwn(repo.branches, name)) {
      return {
        repo,
        output:
          action === "switch"
            ? `fatal: invalid reference: ${name}`
            : `error: pathspec '${name}' did not match any file(s) known to git`,
      };
    }
    if (name === repo.head) {
      return { repo, output: `Already on '${name}'` };
    }

    const to = repo.commits[repo.branches[name]].tree;
    const blocked = findBlockers(repo, to, action);
    if (blocked !== null) {
      return { repo, output: blocked };
    }

    return {
      repo: { ...repo, ...moveFiles(repo, headTree(repo), to), head: name },
      output: `Switched to branch '${name}'`,
    };
  };
}

export const switchBranch = changeBranch("switch");
export const checkout = changeBranch("checkout");
