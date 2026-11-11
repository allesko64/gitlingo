import type { CommandResult, Repo } from "../types";

export function add(repo: Repo, args: string[]): CommandResult {
  if (args.length === 0) {
    return {
      repo,
      output: "Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?",
    };
  }

  const option = args.find((arg) => arg.startsWith("-"));
  if (option !== undefined) {
    return { repo, output: `git add: option '${option}' is not supported yet` };
  }

  if (args.includes(".")) {
    return { repo: { ...repo, index: { ...repo.workingDir } }, output: "" };
  }

  for (const path of args) {
    if (!Object.hasOwn(repo.workingDir, path) && !Object.hasOwn(repo.index, path)) {
      return { repo, output: `fatal: pathspec '${path}' did not match any files` };
    }
  }

  const index = { ...repo.index };
  for (const path of args) {
    if (Object.hasOwn(repo.workingDir, path)) {
      index[path] = repo.workingDir[path];
    } else {
      delete index[path];
    }
  }

  return { repo: { ...repo, index }, output: "" };
}
