import type { CommandResult, Repo } from "../types";

export function remote(repo: Repo, args: string[]): CommandResult {
  const [sub, ...rest] = args;

  if (sub === undefined) {
    return { repo, output: repo.remote === null ? "" : repo.remote.name };
  }

  if (sub === "-v" || sub === "--verbose") {
    if (repo.remote === null) {
      return { repo, output: "" };
    }
    const { name, url } = repo.remote;
    return { repo, output: `${name}\t${url} (fetch)\n${name}\t${url} (push)` };
  }

  if (sub === "add") {
    const [name, url, ...extra] = rest;
    if (name === undefined || url === undefined || extra.length > 0) {
      return { repo, output: "usage: git remote add <name> <url>" };
    }
    if (repo.remote !== null) {
      return {
        repo,
        output:
          repo.remote.name === name
            ? `error: remote ${name} already exists.`
            : "git remote: only one remote is supported here",
      };
    }
    return { repo: { ...repo, remote: { name, url, branches: {} } }, output: "" };
  }

  if (sub.startsWith("-")) {
    return { repo, output: `git remote: option '${sub}' is not supported yet` };
  }

  return { repo, output: `git remote: '${sub}' is not supported yet (try: git remote add <name> <url>)` };
}
