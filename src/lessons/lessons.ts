import {
  branchContains,
  branchExists,
  commitCount,
  fileContent,
  hasFetched,
  hasFile,
  hasRemote,
  headMessage,
  isBehind,
  isChanged,
  isClean,
  isMergeCommit,
  isPushed,
  isStaged,
  ran,
  stashCount,
} from "./checks";
import { teammateCommits } from "./teammate";
import type { Lesson } from "./types";

const FIRST_COMMIT = [
  "git init",
  'echo "Hello" > hello.txt',
  "git add hello.txt",
  'git commit -m "Add hello"',
];

const REMOTE_URL = "https://github.com/you/hello.git";

const PUSHED_TO_ORIGIN = [
  ...FIRST_COMMIT,
  `git remote add origin ${REMOTE_URL}`,
  "git push -u origin main",
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
  {
    id: "see-the-difference",
    title: "See the difference",
    intro:
      "git status tells you which files changed. git diff shows you exactly what changed inside them, line by line, before you commit.",
    setup: FIRST_COMMIT,
    steps: [
      {
        instruction: 'Change the file: `echo "Hello world" > hello.txt`',
        hint: 'Type: echo "Hello world" > hello.txt',
        isDone: ({ repo }) => fileContent(repo, "hello.txt") === "Hello world",
      },
      {
        instruction:
          "Run `git diff`. Lines starting with - are the old version, lines starting with + are the new one.",
        hint: "Type: git diff",
        isDone: (ctx) => ran(ctx, "git diff") && isChanged(ctx.repo, "hello.txt"),
      },
      {
        instruction: "Stage the change with `git add hello.txt`.",
        hint: "Type: git add hello.txt",
        isDone: ({ repo }) => isStaged(repo, "hello.txt"),
      },
      {
        instruction:
          "Run `git diff --staged`. Plain git diff compares with the staging area, so it is empty now. --staged compares staged changes with the last commit.",
        hint: "Type: git diff --staged",
        isDone: (ctx) => ran(ctx, "git diff --staged") && isStaged(ctx.repo, "hello.txt"),
      },
      {
        instruction: 'Commit it: `git commit -m "Say hello to the world"`',
        hint: 'Type: git commit -m "Say hello to the world"',
        isDone: ({ repo }) => commitCount(repo) >= 2,
      },
    ],
    solution: [
      'echo "Hello world" > hello.txt',
      "git diff",
      "git add hello.txt",
      "git diff --staged",
      'git commit -m "Say hello to the world"',
    ],
  },
  {
    id: "undo-a-change",
    title: "Undo a change",
    intro:
      "Mistakes happen. git restore throws away an edit you have not staged, and git restore --staged moves a file back out of the staging area.",
    setup: FIRST_COMMIT,
    steps: [
      {
        instruction: 'Break the file on purpose: `echo "Oops" > hello.txt`',
        hint: 'Type: echo "Oops" > hello.txt',
        isDone: ({ repo }) => fileContent(repo, "hello.txt") === "Oops",
      },
      {
        instruction: "Run `git status`. hello.txt shows as modified.",
        hint: "Type: git status",
        isDone: (ctx) => ran(ctx, "git status"),
      },
      {
        instruction: "Throw the edit away with `git restore hello.txt`.",
        hint: "Type: git restore hello.txt",
        isDone: ({ repo }) => fileContent(repo, "hello.txt") === "Hello",
      },
      {
        instruction: "Run `cat hello.txt`. The file is back to Hello, exactly as in the last commit.",
        hint: "Type: cat hello.txt",
        isDone: (ctx) => ran(ctx, "cat hello.txt"),
      },
      {
        instruction:
          'Now make a real change and stage it: `echo "Hello world" > hello.txt`, then `git add hello.txt`.',
        hint: 'Type: echo "Hello world" > hello.txt, then: git add hello.txt',
        isDone: ({ repo }) => isStaged(repo, "hello.txt"),
      },
      {
        instruction:
          "Changed your mind about staging it? Run `git restore --staged hello.txt`. The edit stays in the file but leaves the staging area.",
        hint: "Type: git restore --staged hello.txt",
        isDone: ({ repo }) => !isStaged(repo, "hello.txt") && isChanged(repo, "hello.txt"),
      },
      {
        instruction: "Run `git status`. The file is modified again but not staged.",
        hint: "Type: git status",
        isDone: (ctx) =>
          ran(ctx, "git status") && !isStaged(ctx.repo, "hello.txt") && isChanged(ctx.repo, "hello.txt"),
      },
    ],
    solution: [
      'echo "Oops" > hello.txt',
      "git status",
      "git restore hello.txt",
      "cat hello.txt",
      'echo "Hello world" > hello.txt',
      "git add hello.txt",
      "git restore --staged hello.txt",
      "git status",
    ],
  },
  {
    id: "fix-the-last-commit",
    title: "Fix the last commit",
    intro:
      "The last commit has a typo in its message. git commit --amend replaces the most recent commit with a corrected one.",
    setup: [...FIRST_COMMIT, 'echo "Notes" > notes.txt', "git add notes.txt", 'git commit -m "Add ntoes"'],
    steps: [
      {
        instruction: "Run `git log --oneline` and spot the typo in the newest message.",
        hint: "Type: git log --oneline",
        isDone: (ctx) => ran(ctx, "git log"),
      },
      {
        instruction: 'Fix it: `git commit --amend -m "Add notes"`',
        hint: 'Type: git commit --amend -m "Add notes"',
        isDone: ({ repo }) => headMessage(repo) === "Add notes",
      },
      {
        instruction:
          "Run `git log --oneline` again. Still two commits, but the top one has a new message and a new hash: amend makes a replacement, it does not edit in place.",
        hint: "Type: git log --oneline",
        isDone: (ctx) => ran(ctx, "git log") && headMessage(ctx.repo) === "Add notes",
      },
    ],
    solution: ["git log --oneline", 'git commit --amend -m "Add notes"', "git log --oneline"],
  },
  {
    id: "rewind-a-commit",
    title: "Rewind a commit",
    intro:
      "git reset moves your branch back to an earlier commit. --soft keeps the changes staged so you can redo the commit. --hard throws them away completely.",
    setup: [...FIRST_COMMIT, 'echo "Notes" > notes.txt', "git add notes.txt", 'git commit -m "Add notes"'],
    steps: [
      {
        instruction: "Run `git log --oneline`. There are two commits.",
        hint: "Type: git log --oneline",
        isDone: (ctx) => ran(ctx, "git log"),
      },
      {
        instruction:
          "Undo the last commit but keep its changes: `git reset --soft HEAD~1`. HEAD~1 means one commit before the current one.",
        hint: "Type: git reset --soft HEAD~1",
        isDone: ({ repo }) => commitCount(repo) === 1 && isStaged(repo, "notes.txt"),
      },
      {
        instruction: "Run `git status`. notes.txt is staged again, as if you never committed it.",
        hint: "Type: git status",
        isDone: (ctx) => ran(ctx, "git status") && isStaged(ctx.repo, "notes.txt"),
      },
      {
        instruction: 'Commit it again with a better message: `git commit -m "Add notes file"`',
        hint: 'Type: git commit -m "Add notes file"',
        isDone: ({ repo }) => commitCount(repo) === 2 && headMessage(repo) === "Add notes file",
      },
      {
        instruction:
          "Now drop that commit and its changes completely: `git reset --hard HEAD~1`. Careful: hard resets cannot be undone from here.",
        hint: "Type: git reset --hard HEAD~1",
        isDone: ({ repo }) => commitCount(repo) === 1 && !hasFile(repo, "notes.txt"),
      },
      {
        instruction: "Run `ls`. notes.txt is gone from the folder too.",
        hint: "Type: ls",
        isDone: (ctx) => ran(ctx, "ls") && !hasFile(ctx.repo, "notes.txt"),
      },
    ],
    solution: [
      "git log --oneline",
      "git reset --soft HEAD~1",
      "git status",
      'git commit -m "Add notes file"',
      "git reset --hard HEAD~1",
      "ls",
    ],
  },
  {
    id: "stash-your-work",
    title: "Put work aside",
    intro:
      "You are halfway through an edit on main when you need to look at the feature branch. Git will not switch if your edit would be lost. git stash parks the edit so you can come back to it.",
    setup: [
      ...FIRST_COMMIT,
      "git branch feature",
      "git switch feature",
      'echo "Feature version" > hello.txt',
      "git add hello.txt",
      'git commit -m "Change hello on feature"',
      "git switch main",
    ],
    steps: [
      {
        instruction: 'Start an edit on main: `echo "Half done" > hello.txt`',
        hint: 'Type: echo "Half done" > hello.txt',
        isDone: ({ repo }) => fileContent(repo, "hello.txt") === "Half done",
      },
      {
        instruction:
          "Try `git switch feature`. Git refuses: feature has a different hello.txt and your edit would be overwritten.",
        hint: "Type: git switch feature and read the error. Then move on to git stash.",
        isDone: (ctx) =>
          (ran(ctx, "git switch feature") && ctx.repo.head === "main") || stashCount(ctx.repo) > 0,
      },
      {
        instruction: "Park the edit with `git stash`.",
        hint: "Type: git stash",
        isDone: ({ repo }) => stashCount(repo) > 0 && isClean(repo),
      },
      {
        instruction: "Run `git status`. The working tree is clean; your edit is safe in the stash.",
        hint: "Type: git status",
        isDone: (ctx) => ran(ctx, "git status") && stashCount(ctx.repo) > 0,
      },
      {
        instruction: "Now `git switch feature` works. Then come back with `git switch main`.",
        hint: "Type: git switch feature, then: git switch main",
        isDone: (ctx) => ran(ctx, "git switch main") && ctx.repo.head === "main" && stashCount(ctx.repo) > 0,
      },
      {
        instruction: "Bring your edit back with `git stash pop`.",
        hint: "Type: git stash pop",
        isDone: ({ repo }) => stashCount(repo) === 0 && fileContent(repo, "hello.txt") === "Half done",
      },
      {
        instruction: "Run `cat hello.txt`. Half done is back, right where you left it.",
        hint: "Type: cat hello.txt",
        isDone: (ctx) => ran(ctx, "cat hello.txt") && fileContent(ctx.repo, "hello.txt") === "Half done",
      },
    ],
    solution: [
      'echo "Half done" > hello.txt',
      "git stash",
      "git status",
      "git switch feature",
      "git switch main",
      "git stash pop",
      "cat hello.txt",
    ],
  },
  {
    id: "push-to-a-remote",
    title: "Push to a remote",
    intro:
      "So far every commit lives only on this computer. A remote is a shared copy of the repository online, like on GitHub. Pushing sends your commits there.",
    setup: FIRST_COMMIT,
    steps: [
      {
        instruction: `Connect this repository to a remote: \`git remote add origin ${REMOTE_URL}\`. origin is just the usual nickname for it.`,
        hint: `Type: git remote add origin ${REMOTE_URL}`,
        isDone: ({ repo }) => hasRemote(repo),
      },
      {
        instruction: "Run `git remote -v` to see the remote you added.",
        hint: "Type: git remote -v",
        isDone: (ctx) => ran(ctx, "git remote -v") && hasRemote(ctx.repo),
      },
      {
        instruction:
          "Send your commits with `git push -u origin main`. -u remembers that main belongs with origin/main, so next time plain git push is enough.",
        hint: "Type: git push -u origin main",
        isDone: ({ repo }) => isPushed(repo) && repo.upstream["main"] === "origin/main",
      },
      {
        instruction: "Run `git status`. It now says your branch is up to date with origin/main.",
        hint: "Type: git status",
        isDone: (ctx) => ran(ctx, "git status") && isPushed(ctx.repo),
      },
      {
        instruction: 'Make another commit: `echo "Notes" > notes.txt`, then add and commit it.',
        hint: 'Type: echo "Notes" > notes.txt, then git add notes.txt, then git commit -m "Add notes"',
        isDone: ({ repo }) => commitCount(repo) >= 2 && !isPushed(repo),
      },
      {
        instruction: "Push it with just `git push`. Thanks to -u, git knows where it goes.",
        hint: "Type: git push",
        isDone: (ctx) => ran(ctx, "git push") && isPushed(ctx.repo) && commitCount(ctx.repo) >= 2,
      },
    ],
    solution: [
      `git remote add origin ${REMOTE_URL}`,
      "git remote -v",
      "git push -u origin main",
      "git status",
      'echo "Notes" > notes.txt',
      "git add notes.txt",
      'git commit -m "Add notes"',
      "git push",
    ],
  },
  {
    id: "fetch-and-pull",
    title: "Get your teammate's work",
    intro:
      "This repository is already connected to origin. While you were away, a teammate pushed a commit there. git fetch looks at what is new; git pull brings it into your branch.",
    setup: PUSHED_TO_ORIGIN,
    prepare: teammateCommits("Add README", { "README.md": "# Hello project" }),
    steps: [
      {
        instruction: "Run `git status`. Git still thinks you are up to date: it has not looked at the remote yet.",
        hint: "Type: git status",
        isDone: (ctx) => ran(ctx, "git status"),
      },
      {
        instruction: "Check the remote with `git fetch`. It downloads new commits without touching your files.",
        hint: "Type: git fetch",
        isDone: ({ repo }) => hasFetched(repo),
      },
      {
        instruction:
          "Run `git status` again. Now it says you are behind origin/main by 1 commit.",
        hint: "Type: git status",
        isDone: (ctx) => ran(ctx, "git status") && isBehind(ctx.repo),
      },
      {
        instruction: "Bring the commit into main with `git pull`.",
        hint: "Type: git pull",
        isDone: ({ repo }) => hasFile(repo, "README.md") && !isBehind(repo),
      },
      {
        instruction: "Run `ls`. README.md from your teammate is here now.",
        hint: "Type: ls",
        isDone: (ctx) => ran(ctx, "ls") && hasFile(ctx.repo, "README.md"),
      },
    ],
    solution: ["git status", "git fetch", "git status", "git pull", "ls"],
  },
  {
    id: "when-push-is-rejected",
    title: "When push is rejected",
    intro:
      "You and a teammate both made a commit since the last push. Theirs is already on origin. Git will not let you push over it, so you pull first, then push.",
    setup: [...PUSHED_TO_ORIGIN, 'echo "Notes" > notes.txt', "git add notes.txt", 'git commit -m "Add notes"'],
    prepare: teammateCommits("Add README", { "README.md": "# Hello project" }),
    steps: [
      {
        instruction:
          "Try `git push`. It is rejected: the remote has work you do not have yet. Read the hint git gives you.",
        hint: "Type: git push. The rejection is expected; the next step fixes it.",
        isDone: (ctx) => ran(ctx, "git push") && !isPushed(ctx.repo),
      },
      {
        instruction:
          "Run `git pull`. Git fetches the teammate's commit and merges it with yours in a merge commit.",
        hint: "Type: git pull",
        isDone: ({ repo }) => isMergeCommit(repo, "main") && hasFile(repo, "README.md"),
      },
      {
        instruction: "Run `git log --oneline`. Your commit, theirs, and the merge on top.",
        hint: "Type: git log --oneline",
        isDone: (ctx) => ran(ctx, "git log") && isMergeCommit(ctx.repo, "main"),
      },
      {
        instruction: "Now `git push` goes through.",
        hint: "Type: git push",
        isDone: (ctx) => ran(ctx, "git push") && isPushed(ctx.repo) && isMergeCommit(ctx.repo, "main"),
      },
    ],
    solution: ["git push", "git pull", "git log --oneline", "git push"],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}
