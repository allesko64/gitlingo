import type { CommandResult, Repo } from "../types";
import { ancestors, isUnborn } from "./helpers";

export function push(repo: Repo, args: string[]): CommandResult {
  const setUpstream = args.includes("-u") || args.includes("--set-upstream");
  const rest = args.filter((arg) => arg !== "-u" && arg !== "--set-upstream");

  const option = rest.find((arg) => arg.startsWith("-"));
  if (option !== undefined) {
    return { repo, output: `git push: option '${option}' is not supported yet` };
  }
  if (rest.length === 1 || rest.length > 2) {
    return { repo, output: "usage: git push [-u] <remote> <branch>" };
  }

  if (repo.remote === null) {
    return {
      repo,
      output:
        "fatal: No configured push destination.\nhint: Add a remote first: git remote add origin <url>",
    };
  }

  const remoteName = rest[0] ?? repo.remote.name;
  if (remoteName !== repo.remote.name) {
    return {
      repo,
      output: `fatal: '${remoteName}' does not appear to be a git repository\nfatal: Could not read from remote repository.`,
    };
  }

  const branch = rest[1] ?? repo.head;
  const tracking = `${remoteName}/${branch}`;

  if (rest.length === 0 && !Object.hasOwn(repo.upstream, repo.head)) {
    return {
      repo,
      output: [
        `fatal: The current branch ${repo.head} has no upstream branch.`,
        "To push the current branch and set the remote as upstream, use",
        "",
        `    git push --set-upstream ${remoteName} ${repo.head}`,
        "",
        `hint: or the short form: git push -u ${remoteName} ${repo.head}`,
      ].join("\n"),
    };
  }

  if (!Object.hasOwn(repo.branches, branch) || (branch === repo.head && isUnborn(repo))) {
    return {
      repo,
      output: `error: src refspec ${branch} does not match any\nerror: failed to push some refs to '${repo.remote.url}'`,
    };
  }

  const local = repo.branches[branch];
  const theirs = repo.remote.branches[branch];
  const lines: string[] = [];

  if (theirs === local) {
    lines.push("Everything up-to-date");
  } else if (theirs !== undefined && !ancestors(repo, local).includes(theirs)) {
    return {
      repo,
      output: [
        `To ${repo.remote.url}`,
        ` ! [rejected]        ${branch} -> ${branch} (fetch first)`,
        `error: failed to push some refs to '${repo.remote.url}'`,
        "hint: Updates were rejected because the remote contains work that you do not have locally.",
        "hint: Run 'git pull' to bring that work in, then push again.",
      ].join("\n"),
    };
  } else {
    lines.push(
      `To ${repo.remote.url}`,
      theirs === undefined
        ? ` * [new branch]      ${branch} -> ${branch}`
        : `   ${theirs}..${local}  ${branch} -> ${branch}`,
    );
  }

  const upstream = setUpstream ? { ...repo.upstream, [branch]: tracking } : repo.upstream;
  if (setUpstream && repo.upstream[branch] !== tracking) {
    lines.push(`branch '${branch}' set up to track '${tracking}'.`);
  }

  return {
    repo: {
      ...repo,
      remote: { ...repo.remote, branches: { ...repo.remote.branches, [branch]: local } },
      remoteRefs: { ...repo.remoteRefs, [tracking]: local },
      upstream,
    },
    output: lines.join("\n"),
  };
}
