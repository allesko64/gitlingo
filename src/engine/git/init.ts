import type { CommandResult, Repo } from "../types";

export function init(repo: Repo, args: string[]): CommandResult {
  if (args.length > 0) {
    return { repo, output: "git init: options are not supported yet" };
  }

  if (repo.initialized) {
    return { repo, output: "Reinitialized existing Git repository in .git/" };
  }

  return {
    repo: { ...repo, initialized: true, head: "main" },
    output: "Initialized empty Git repository in .git/",
  };
}
