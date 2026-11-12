import type { CommandResult, Repo } from "../types";

const NO_REMOTE =
  "fatal: No remote repository specified.\nhint: Add one first: git remote add origin <url>";

export function fetchFromRemote(repo: Repo): CommandResult {
  if (repo.remote === null) {
    return { repo, output: NO_REMOTE };
  }

  const { name, url, branches } = repo.remote;
  const remoteRefs = { ...repo.remoteRefs };
  const lines: string[] = [];

  for (const branch of Object.keys(branches).sort()) {
    const tracking = `${name}/${branch}`;
    const before = remoteRefs[tracking];
    const after = branches[branch];

    if (before === after) {
      continue;
    }
    remoteRefs[tracking] = after;
    lines.push(
      before === undefined
        ? ` * [new branch]      ${branch.padEnd(10)} -> ${tracking}`
        : `   ${before}..${after}  ${branch.padEnd(10)} -> ${tracking}`,
    );
  }

  if (lines.length === 0) {
    return { repo, output: "" };
  }

  return { repo: { ...repo, remoteRefs }, output: [`From ${url}`, ...lines].join("\n") };
}

export function fetch(repo: Repo, args: string[]): CommandResult {
  const option = args.find((arg) => arg.startsWith("-"));
  if (option !== undefined) {
    return { repo, output: `git fetch: option '${option}' is not supported yet` };
  }
  if (args.length > 1) {
    return { repo, output: "usage: git fetch [<remote>]" };
  }
  if (repo.remote === null) {
    return { repo, output: NO_REMOTE };
  }
  if (args.length === 1 && args[0] !== repo.remote.name) {
    return {
      repo,
      output: `fatal: '${args[0]}' does not appear to be a git repository\nfatal: Could not read from remote repository.`,
    };
  }

  return fetchFromRemote(repo);
}
