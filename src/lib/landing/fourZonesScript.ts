export type FileId = "index.html" | "style.css" | "notes.txt";
export type FileStatus = "new" | "modified" | "staged" | "saved" | "updated";
export type Commit = { hash: string; message: string; author: "you" | "teammate" };
export type ZoneName = "working" | "staging" | "local" | "remote";

export type ZoneState = {
  working: Record<FileId, FileStatus>;
  staging: FileId[];
  local: Commit[];
  remote: Commit[];
};

export type Move = {
  kind: "copy" | "merge";
  from: ZoneName;
  to: ZoneName;
  items: (FileId | string)[];
};

export type Step = {
  id: string;
  command: string | null;
  comment?: string;
  caption: string;
  activeArrow: "add" | "commit" | "push" | "pull" | null;
  moves: Move[];
  state: ZoneState;
  flash?: { file: FileId; status: "updated"; ms: number };
};

export const FILE_IDS: FileId[] = ["index.html", "style.css", "notes.txt"];
export const ZONE_NAMES: ZoneName[] = ["working", "staging", "local", "remote"];

const HOMEPAGE: Commit = { hash: "a1b2c3d", message: "add homepage", author: "you" };
const FIX_TYPO: Commit = { hash: "9f8e7d6", message: "fix typo", author: "teammate" };

export const FOUR_ZONES_SCRIPT: Step[] = [
  {
    id: "start",
    command: null,
    caption: "This is your project folder. Git is watching it. Nothing is saved yet.",
    activeArrow: null,
    moves: [],
    state: {
      working: { "index.html": "new", "style.css": "new", "notes.txt": "new" },
      staging: [],
      local: [],
      remote: [],
    },
  },
  {
    id: "add",
    command: "git add index.html style.css",
    caption: "add picks what goes into the next save. notes.txt stays out on purpose.",
    activeArrow: "add",
    moves: [{ kind: "copy", from: "working", to: "staging", items: ["index.html", "style.css"] }],
    state: {
      working: { "index.html": "staged", "style.css": "staged", "notes.txt": "new" },
      staging: ["index.html", "style.css"],
      local: [],
      remote: [],
    },
  },
  {
    id: "commit",
    command: 'git commit -m "add homepage"',
    caption: "commit saves the picked files as one snapshot. It lives on your computer.",
    activeArrow: "commit",
    moves: [{ kind: "merge", from: "staging", to: "local", items: ["index.html", "style.css"] }],
    state: {
      working: { "index.html": "saved", "style.css": "saved", "notes.txt": "new" },
      staging: [],
      local: [HOMEPAGE],
      remote: [],
    },
  },
  {
    id: "push",
    command: "git push",
    caption: "push sends a copy of your snapshot online. Yours stays here too.",
    activeArrow: "push",
    moves: [{ kind: "copy", from: "local", to: "remote", items: [HOMEPAGE.hash] }],
    state: {
      working: { "index.html": "saved", "style.css": "saved", "notes.txt": "new" },
      staging: [],
      local: [HOMEPAGE],
      remote: [HOMEPAGE],
    },
  },
  {
    id: "teammate",
    command: null,
    comment: "a teammate pushed a fix",
    caption: "A teammate saved a change online. You do not have it yet.",
    activeArrow: null,
    moves: [],
    state: {
      working: { "index.html": "saved", "style.css": "saved", "notes.txt": "new" },
      staging: [],
      local: [HOMEPAGE],
      remote: [HOMEPAGE, FIX_TYPO],
    },
  },
  {
    id: "pull",
    command: "git pull",
    caption: "pull brings new snapshots down and updates your files.",
    activeArrow: "pull",
    moves: [{ kind: "copy", from: "remote", to: "local", items: [FIX_TYPO.hash] }],
    state: {
      working: { "index.html": "saved", "style.css": "saved", "notes.txt": "new" },
      staging: [],
      local: [HOMEPAGE, FIX_TYPO],
      remote: [HOMEPAGE, FIX_TYPO],
    },
    flash: { file: "style.css", status: "updated", ms: 1200 },
  },
];

export function itemsIn(state: ZoneState, zone: ZoneName): string[] {
  if (zone === "working") {
    return Object.keys(state.working);
  }
  if (zone === "staging") {
    return [...state.staging];
  }
  return state[zone].map((commit) => commit.hash);
}

export function arrivals(before: ZoneState, after: ZoneState): string[] {
  return ZONE_NAMES.flatMap((zone) => {
    const old = new Set(itemsIn(before, zone));
    return itemsIn(after, zone)
      .filter((item) => !old.has(item))
      .map((item) => `${zone}:${item}`);
  });
}
