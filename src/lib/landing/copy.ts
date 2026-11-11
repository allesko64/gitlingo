export const FIRST_LEVEL_HREF = "/lessons/start-a-repository";

export const HEADLINE = "Learn git by actually using it.";

export const HEADLINE_OPTIONS = [
  "Learn git by actually using it.",
  "Git, without the fear.",
  "Type it. Watch it move. Get it.",
] as const;

export const copy = {
  meta: {
    title: "Git Lingo · Learn git by actually using it",
    description:
      "Type real git commands and watch your files move between four places. No setup needed, works on your phone.",
  },
  nav: {
    wordmark: "Git Lingo",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "The four zones", href: "#four-zones" },
      { label: "Levels", href: "#levels" },
    ],
    cta: "Start level 1",
  },
  hero: {
    label: "v0.1 · beginner friendly",
    learnersLabel: "learners and counting",
    headline: HEADLINE,
    sub: "Type real commands. Watch your files move. No setup needed.",
    primary: "Start level 1",
    secondary: "See how it works",
    secondaryHref: "#four-zones",
    note: "No sign-up needed · Works on your phone",
    afterFirstCommand: "Nice. Level 1 goes deeper",
  },
  terminal: {
    title: "~/my-first-repo",
    fileName: "README.md",
    welcome: "This folder has one file: README.md.\nType git init to turn it into a repository.",
    takeover: "Your turn. This is a fresh folder with README.md.\nType git init to start, or help to see every command.",
    autoHint: "click here and try it yourself",
    label: "Practice terminal. Type a git command and press Enter.",
    notSupported: (command: string) =>
      `${command} is not supported here yet. Type help to see what you can try.`,
    help: [
      "Try these, one at a time:",
      "  git init                 start a repository",
      "  git status               see what git sees",
      "  git add .                stage every file",
      '  git commit -m "first"    save a snapshot',
      "  git log                  see the history",
      "  clear                    clear the screen",
    ].join("\n"),
  },
  zones: {
    working: "Working",
    staging: "Staging",
    local: "Local",
    remote: "Remote",
  },
  fourZones: {
    label: "1.0 · THE FOUR ZONES",
    title: "Every git command moves files between four places.",
    sub: "Click through the story. It takes less than a minute.",
    zones: {
      working: { title: "Working directory", line: "Your desk. The files you edit." },
      staging: { title: "Staging area", line: "The box. Files picked for the next save." },
      local: { title: "Local repository", line: "Your album. Saved snapshots, on your computer." },
      remote: { title: "Remote", line: "The cloud. A shared copy online, like GitHub." },
    },
    onYourComputer: "ON YOUR COMPUTER",
    online: "ONLINE",
    empty: "empty",
    end: "That's the whole map. Every level in Git Lingo is a walk through these four zones.",
    next: "Next",
    nextLabel: "Next step",
    back: "Back",
    backLabel: "Back to previous step",
    replay: "Replay",
    startLevel: "Start level 1",
  },
  howItWorks: {
    label: "2.0 · HOW A LEVEL WORKS",
    title: "Every level works the same simple way.",
    sub: "Three steps, repeated until git feels natural.",
    cards: [
      {
        title: "Read the story",
        body: "Each level starts with a short story: what you are building and why.",
      },
      {
        title: "Type the command",
        body: "Type a real git command in the terminal. Hints help when you get stuck.",
      },
      {
        title: "See it happen",
        body: "Watch your files move between the zones, so you see what git did.",
      },
    ],
    demoCommand: "git add .",
  },
  levels: {
    label: "3.0 · THE LEVELS",
    title: "Six levels to your first real git workflow.",
    sub: "Start at level 1. Each level unlocks the next.",
    start: "Start",
    locked: "Locked",
    unlocksAfter: (level: number) => `Unlocks after level ${level}`,
    list: [
      { title: "First repo", command: "git init", line: "Turn a folder into a repository." },
      { title: "Stage a file", command: "git add", line: "Pick what goes into your next save." },
      { title: "Commit", command: "git commit", line: "Save a snapshot with a message." },
      { title: "History", command: "git log", line: "Look back at every snapshot you made." },
      { title: "Branch and switch", command: "git switch", line: "Try an idea on its own line of work." },
      { title: "Merge", command: "git merge", line: "Bring two lines of work back together." },
    ],
    more: "More levels coming: remotes, rebase, reset, reflog, stash, cherry-pick.",
  },
  finalCta: {
    title: "Ready to stop being scared of git?",
    button: "Start level 1",
  },
  footer: {
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "All levels", href: "/lessons" },
    ],
    builtBy: "Built by",
    author: "Aks",
    authorHref: "https://x.com/ayush__64",
    authorLabel: "Aks on X (@ayush__64)",
  },
  statusCards: [
    { label: "Level done", name: "First repo", status: "done", command: false },
    { label: "Running", name: "git add .", status: "running", command: true },
    { label: "Locked", name: "Commit", status: "locked", command: false },
  ],
} as const;
