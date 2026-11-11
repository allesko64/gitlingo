export type FilePath = string;

export type CommitHash = string;

export type FileTree = Record<FilePath, string>;

export interface Commit {
  hash: CommitHash;
  order: number;
  message: string;
  parents: CommitHash[];
  tree: FileTree;
}

export interface Repo {
  initialized: boolean;
  workingDir: FileTree;
  index: FileTree;
  commits: Record<CommitHash, Commit>;
  branches: Record<string, CommitHash>;
  head: string;
}

export interface CommandResult {
  repo: Repo;
  output: string;
}
