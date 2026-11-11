import type { Repo } from "./types";

export function createEmptyRepo(): Repo {
  return {
    initialized: false,
    workingDir: {},
    index: {},
    commits: {},
    branches: {},
    head: "main",
  };
}
