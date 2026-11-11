import type { ShellCommand } from "../shell";
import type { CommandResult, Repo } from "../types";
import { add } from "./add";
import { branch } from "./branch";
import { commit } from "./commit";
import { init } from "./init";
import { log } from "./log";
import { merge } from "./merge";
import { status } from "./status";
import { checkout, switchBranch } from "./switch";

type GitSubcommand = (repo: Repo, args: string[]) => CommandResult;

const subcommands: Record<string, GitSubcommand> = {
  init,
  status,
  add,
  commit,
  log,
  branch,
  switch: switchBranch,
  checkout,
  merge,
};

export const git: ShellCommand = (repo, { args }) => {
  if (args.length === 0) {
    return { repo, output: "usage: git <command>" };
  }

  const [name, ...rest] = args;

  if (!Object.hasOwn(subcommands, name)) {
    return { repo, output: `git: '${name}' is not a git command. See 'git --help'.` };
  }

  if (name !== "init" && !repo.initialized) {
    return {
      repo,
      output: "fatal: not a git repository (or any of the parent directories): .git",
    };
  }

  return subcommands[name](repo, rest);
};
