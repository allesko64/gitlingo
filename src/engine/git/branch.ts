import type { CommandResult, Repo } from "../types";
import { isUnborn } from "./helpers";

const VALID_NAME = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

export function branch(repo: Repo, args: string[]): CommandResult {
  if (args.length === 0) {
    const lines = Object.keys(repo.branches)
      .sort()
      .map((name) => (name === repo.head ? `* ${name}` : `  ${name}`));
    return { repo, output: lines.join("\n") };
  }

  if (args[0].startsWith("-")) {
    return { repo, output: `git branch: option '${args[0]}' is not supported yet` };
  }
  if (args.length > 1) {
    return { repo, output: "git branch: only one branch name at a time" };
  }

  const name = args[0];

  if (!VALID_NAME.test(name)) {
    return { repo, output: `fatal: '${name}' is not a valid branch name` };
  }
  if (Object.hasOwn(repo.branches, name)) {
    return { repo, output: `fatal: a branch named '${name}' already exists` };
  }
  if (isUnborn(repo)) {
    return {
      repo,
      output: `fatal: not a valid object name: '${repo.head}'\nhint: make your first commit before creating branches`,
    };
  }

  return {
    repo: { ...repo, branches: { ...repo.branches, [name]: repo.branches[repo.head] } },
    output: "",
  };
}
