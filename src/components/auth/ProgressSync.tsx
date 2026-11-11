"use client";

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { readGuestProgress, replaceProgress, resetProgress, syncProgress } from "@/lib/useProgress";

/** Keeps this browser's progress and the account's saved progress the same. Renders nothing. */
export function ProgressSync() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id ?? null;
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (userId === null) {
      // Do not leave the last user's progress on a shared computer.
      if (previous.current !== null) {
        resetProgress();
      }
      previous.current = null;
      return;
    }

    previous.current = userId;
    let cancelled = false;

    async function sync() {
      try {
        let ids = await syncProgress(readGuestProgress().completed);
        if (cancelled) {
          return;
        }
        // Catch levels finished while the first round-trip was in flight.
        const local = readGuestProgress().completed;
        if (local.some((id) => !ids.includes(id))) {
          ids = await syncProgress(local);
        }
        if (!cancelled) {
          replaceProgress(ids);
        }
      } catch {
        // Keep local progress; the next login retries.
      }
    }

    void sync();

    return () => {
      cancelled = true;
    };
  }, [userId, isPending]);

  return null;
}
