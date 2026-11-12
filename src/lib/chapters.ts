import { copy } from "./landing/copy";

export interface ChapterGroup<T> {
  number: number;
  title: string;
  line: string;
  firstLevel: number;
  items: T[];
}

export function groupByChapter<T>(items: readonly T[]): ChapterGroup<T>[] {
  const groups: ChapterGroup<T>[] = [];
  let start = 0;

  copy.levels.chapters.forEach((chapter, i) => {
    groups.push({
      number: i + 1,
      title: chapter.title,
      line: chapter.line,
      firstLevel: start + 1,
      items: items.slice(start, start + chapter.count),
    });
    start += chapter.count;
  });

  return groups;
}

export const chapterLabel = (n: number) => `CHAPTER ${n}`;
