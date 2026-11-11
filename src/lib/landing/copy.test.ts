import { describe, expect, it } from "vitest";
import { lessons } from "@/lessons/lessons";
import { copy, FIRST_LEVEL_HREF } from "./copy";

describe("landing copy", () => {
  it("previews the 6 launch levels in order", () => {
    expect(copy.levels.list.map((level) => level.title)).toEqual([
      "First repo",
      "Stage a file",
      "Commit",
      "History",
      "Branch and switch",
      "Merge",
    ]);
  });

  it("gives every level a git command", () => {
    for (const level of copy.levels.list) {
      expect(level.command, level.title).toMatch(/^git \w+/);
    }
  });

  it("explains which level unlocks each locked one", () => {
    expect(copy.levels.unlocksAfter(2)).toBe("Unlocks after level 2");
  });

  it("has the 3 how-it-works cards", () => {
    expect(copy.howItWorks.cards.map((card) => card.title)).toEqual([
      "Read the story",
      "Type the command",
      "See it happen",
    ]);
  });

  it("points every call to action at level 1", () => {
    expect(FIRST_LEVEL_HREF).toBe(`/lessons/${lessons[0].id}`);
  });

  it("previews exactly the lessons the app has", () => {
    expect(copy.levels.list.map((level) => level.title)).toEqual(lessons.map((lesson) => lesson.title));
  });

  it("links the navbar and footer to places that exist", () => {
    const places = ["#how-it-works", "#four-zones", "#levels", "/#how-it-works", "/lessons"];
    for (const link of [...copy.nav.links, ...copy.footer.links]) {
      expect(places, link.label).toContain(link.href);
    }
  });
});
