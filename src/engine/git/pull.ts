import type { CommandResult, Repo } from "../types";
import { fetchFromRemote } from "./fetch";
import { isUnborn } from "./helpers";
import { mergeInto } from "./merge";

export function pull(repo: Repo, args: string[]): CommandResult {
  const option = args.find((arg) => arg.startsWith("-"));
  if (option !== undefined) {
    return { repo, output: `git pull: option '${option}' is not supported yet` };
  }
  if (args.length === 1 || args.length > 2) {
    return { repo, output: "usage: git pull [<remote> <branch>]" };
  }
  if (repo.remote === null) {
    return {
      repo,
      output: "fatal: No remote repository specified.\nhint: Add one first: git remote add origin <url>",
    };
  }

  const remoteName = args[0] ?? repo.remote.name;
  if (remoteName !== repo.remote.name) {
    return {
      repo,
      output: `fatal: '${remoteName}' does not appear to be a git repository\nfatal: Could not read from remote repository.`,
    };
  }

  const branch = args[1] ?? repo.upstream[repo.head]?.slice(remoteName.length + 1);
  if (branch === undefined) {
    return {
      repo,
      output: [
        "There is no tracking information for the current branch.",
        "Please specify which branch you want to merge with:",
        "",
        `    git pull ${remoteName} <branch>`,
        "",
        `hint: or set it once with: git push -u ${remoteName} ${repo.head}`,
      ].join("\n"),
    };
  }

  const fetched = fetchFromRemote(repo);
  const tracking = `${remoteName}/${branch}`;
  const target = fetched.repo.remoteRefs[tracking];

  if (target === undefined) {
    return {
      repo: fetched.repo,
      output: `fatal: couldn't find remote ref ${branch}`,
    };
  }

  if (isUnborn(fetched.repo)) {
    const tree = fetched.repo.commits[target].tree;
    return {
      repo: {
        ...fetched.repo,
        workingDir: { ...fetched.repo.workingDir, ...tree },
        index: { ...tree },
        branches: { ...fetched.repo.branches, [repo.head]: target },
      },
      output: [fetched.output, `Updating to ${target}`].filter(Boolean).join("\n"),
    };
  }

  const merged = mergeInto(fetched.repo, target, `Merge branch '${branch}' of ${repo.remote.url}`);
  return {
    repo: merged.repo,
    output: [fetched.output, merged.output].filter(Boolean).join("\n"),
  };
}
