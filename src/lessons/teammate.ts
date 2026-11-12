import { makeCommit } from "@/engine/git/helpers";
import type { FileTree, Repo } from "@/engine/types";

export function teammateCommits(message: string, files: FileTree, branch = "main") {
  return (repo: Repo): Repo => {
    if (repo.remote === null) {
      throw new Error("teammateCommits needs a remote: push to origin in setup first");
    }

    const parent = repo.remote.branches[branch];
    const tree = parent === undefined ? files : { ...repo.commits[parent].tree, ...files };
    const commit = makeCommit(repo, message, parent === undefined ? [] : [parent], tree);

    return {
      ...repo,
      commits: { ...repo.commits, [commit.hash]: commit },
      remote: { ...repo.remote, branches: { ...repo.remote.branches, [branch]: commit.hash } },
    };
  };
}
