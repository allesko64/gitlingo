"use client";

import { useMemo, useSyncExternalStore } from "react";
import { markComplete, parseProgress, PROGRESS_EVENT, PROGRESS_KEY, type Progress } from "./progress";

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(PROGRESS_KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PROGRESS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PROGRESS_EVENT, onChange);
  };
}

function subscribeNever() {
  return () => {};
}

function write(progress: Progress | null) {
  try {
    if (progress === null) {
      window.localStorage.removeItem(PROGRESS_KEY);
    } else {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    }
  } catch {
    return;
  }
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

export function readGuestProgress(): Progress {
  return parseProgress(readRaw());
}

/** Pushes local lesson ids to the account. Throws on network/auth failure. */
export async function syncProgress(lessonIds: string[]): Promise<string[]> {
  const response = await fetch("/api/progress", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lessonIds }),
  });
  if (!response.ok) {
    throw new Error(response.status === 401 ? "Unauthorized" : "Sync failed");
  }
  const data: unknown = await response.json();
  const completed = (data as { completed?: unknown }).completed;
  return Array.isArray(completed) ? completed.filter((id): id is string => typeof id === "string") : [];
}

async function syncProgressWithRetry(lessonIds: string[]): Promise<string[]> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await syncProgress(lessonIds);
    } catch (error) {
      lastError = error;
      if (error instanceof Error && error.message === "Unauthorized") {
        throw error;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 200 * (attempt + 1)));
    }
  }
  throw lastError;
}

export async function completeLesson(id: string): Promise<void> {
  const next = markComplete(parseProgress(readRaw()), id);
  write(next);
  try {
    replaceProgress(await syncProgressWithRetry(next.completed));
  } catch {
    // Still saved in this browser; ProgressSync merges on the next login.
  }
}

export function replaceProgress(ids: string[]) {
  write(parseProgress(JSON.stringify({ completed: ids })));
}

export function resetProgress() {
  write(null);
}

export function useProgress() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);
  const progress = useMemo(() => parseProgress(raw), [raw]);
  return { progress, hydrated };
}
