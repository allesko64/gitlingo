import {
  branchContains,
  branchExists,
  commitCount,
  hasFile,
  isChanged,
  isMergeCommit,
  isStaged,
  ran,
} from "./checks";
import type { Lesson } from "./types";

const FIRST_COMMIT = [
  "git init",
  'echo "Hello" > hello.txt',
  "git add hello.txt",
  'git commit -m "Add hello"',
];

export const lessons: Lesson[] = [
  {
    id: "start-a-repository",
    title: "First repo",
    intro:
      "Git only tracks folders you ask it to. Running git init turns an ordinary folder into a repository: a folder with a history.",
    setup: [],
    steps: [
      {
        instruction: "Turn this folder into a Git repository with `git init`.",
        hint: "Type exactly: git init",
        isDone: ({ repo }) => repo.initialized,
      },
      {
        instruction: "Ask Git what it sees with `git status`.",
        hint: "Type: git status. It says you are on branch main with no commits yet.",
        isDone: (ctx) => ran(ctx, "git status"),
      },
    ],
    solution: ["git init", "git status"],
  },
  {
    id: "stage-a-file",
    title: "Stage a file",
    intro:
      "Git does not save everything automatically. First you pick which files go into the next save. Picking a file is called staging.",
    setup: ["git init"],
    steps: [
      {
        instruction: 'Create a file: `echo "Hello" > hello.txt`',
        hint: 'Type: echo "Hello" > hello.txt. Then try ls to see it.',
        isDone: ({ repo }) => hasFile(repo, "hello.txt"),
      },
      {
        instruction: "Run `git status`. Git sees the file but is not tracking it yet: it is untracked.",
        hint: "Type: git status",
        isDone: (ctx) => ran(ctx, "git status"),
      },
      {
        instruction: "Stage the file with `git add hello.txt`.",
        hint: "Type: git add hello.txt",
        isDone: ({ repo }) => isStaged(repo, "hello.txt"),
      },
      {
        instruction: "Run `git status` again. hello.txt is now under Changes to be committed.",
        hint: "Type: git status",
        isDone: (ctx) => ran(ctx, "git status") && isStaged(ctx.repo, "hello.txt"),
      },
    ],
    solution: ['echo "Hello" > hello.txt', "git status", "git add hello.txt", "git status"],
  },
  {
    id: "commit",
    title: "Commit",
    intro:
      "A commit saves everything you staged as one snapshot, with a short message that says what changed.",
    setup: ["git init", 'echo "Hello" > hello.txt', "git add hello.txt"],
    steps: [
      {
        instruction: "Run `git status`. hello.txt is staged and ready to be saved.",
        hint: "Type: git status",
        isDone: (ctx) => ran(ctx, "git status"),
      },
      {
        instruction: 'Save the snapshot: `git commit -m "Add hello"`',
        hint: 'Type: git commit -m "Add hello". Keep the quotes around the message.',
        isDone: ({ repo }) => commitCount(repo) >= 1,
      },
      {
        instruction: "Run `git log` to see your first commit in the history.",
        hint: "Type: git log",
        isDone: (ctx) => ran(ctx, "git log") && commitCount(ctx.repo) >= 1,
      },
    ],
    solution: ["git status", 'git commit -m "Add hello"', "git log"],
  },
  {
    id: "changes-and-history",
    title: "History",
    intro:
      "This repository already has one commit. Each time you change a file and commit again, Git adds a new snapshot to the history.",
    setup: FIRST_COMMIT,
    steps: [
      {
        instruction: 'Change the file: `echo "Hello again" > hello.txt`',
        hint: 'Type: echo "Hello again" > hello.txt',
        isDone: ({ repo }) => isChanged(repo, "hello.txt"),
      },
      {
        instruction: "Run `git status`. The file now shows as modified.",
        hint: "Type: git status",
        isDone: (ctx) => ran(ctx, "git status"),
      },
      {
        instruction: "Stage and commit the change with `git add` and `git commit -m`.",
        hint: 'Type: git add hello.txt, then: git commit -m "Update hello"',
        isDone: ({ repo }) => commitCount(repo) >= 2,
      },
      {
        instruction: "See the whole history with `git log --oneline`. The newest commit is at the top.",
        hint: "Type: git log --oneline",
        isDone: (ctx) => ran(ctx, "git log"),
      },
    ],
    solution: [
      'echo "Hello again" > hello.txt',
      "git status",
      "git add hello.txt",
      'git commit -m "Update hello"',
      "git log --oneline",
    ],
  },
  {
    id: "branches",
    title: "Branch and switch",
    intro:
      "A branch is a separate line of work. You can try things on a branch without touching main, then switch back whenever you like.",
    setup: FIRST_COMMIT,
    steps: [
      {
        instruction: "Create a branch called feature: `git branch feature`",
        hint: "Type: git branch feature. Then git branch lists every branch.",
        isDone: ({ repo }) => branchExists(repo, "feature"),
      },
      {
        instruction: "Move onto it with `git switch feature`.",
        hint: "Type: git switch feature",
        isDone: ({ repo }) => repo.head === "feature",
      },
      {
        instruction:
          'Make a commit on feature: create feature.txt with `echo "New idea" > feature.txt`, then add and commit it.',
        hint: 'Type: echo "New idea" > feature.txt, then git add feature.txt, then git commit -m "Add feature"',
        isDone: ({ repo }) =>
          repo.head === "feature" && !branchContains(repo, "main", "feature"),
      },
      {
        instruction: "Go back to main with `git switch main`.",
        hint: "Type: git switch main",
        isDone: ({ repo }) => repo.head === "main",
      },
      {
        instruction: "Run `ls`. feature.txt is gone, because it only exists on the feature branch.",
        hint: "Type: ls. Switch to feature again and it comes back.",
        isDone: (ctx) => ran(ctx, "ls") && ctx.repo.head === "main",
      },
    ],
    solution: [
      "git branch feature",
      "git switch feature",
      'echo "New idea" > feature.txt',
      "git add feature.txt",
      'git commit -m "Add feature"',
      "git switch main",
      "ls",
    ],
  },
  {
    id: "merging",
    title: "Merge",
    intro:
      "The feature branch has a commit that main does not. Merging brings that work into main, so both lines of history come together.",
    setup: [
      ...FIRST_COMMIT,
      "git branch feature",
      "git switch feature",
      'echo "New idea" > feature.txt',
      "git add feature.txt",
      'git commit -m "Add feature"',
      "git switch main",
    ],
    steps: [
      {
        instruction: "Run `git log --oneline`. The feature commit is not on main yet.",
        hint: "Type: git log --oneline",
        isDone: (ctx) => ran(ctx, "git log"),
      },
      {
        instruction:
          'Make a commit on main too: `echo "Some notes" > notes.txt`, then add and commit it.',
        hint: 'Type: echo "Some notes" > notes.txt, then git add notes.txt, then git commit -m "Add notes"',
        isDone: ({ repo }) =>
          repo.head === "main" && !branchContains(repo, "feature", "main"),
      },
      {
        instruction: "Bring feature into main with `git merge feature`.",
        hint: "Type: git merge feature (make sure you are on main)",
        isDone: ({ repo }) => isMergeCommit(repo, "main") && branchContains(repo, "main", "feature"),
      },
      {
        instruction:
          "Run `git log --oneline` again. You will see commits from both branches and the merge commit on top.",
        hint: "Type: git log --oneline",
        isDone: (ctx) => ran(ctx, "git log") && isMergeCommit(ctx.repo, "main"),
      },
    ],
    solution: [
      "git log --oneline",
      'echo "Some notes" > notes.txt',
      "git add notes.txt",
      'git commit -m "Add notes"',
      "git merge feature",
      "git log --oneline",
    ],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}
