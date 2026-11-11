import { count } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

/** The public counter starts here, then adds every real sign-up. */
export const LEARNER_BASE = 100;

export async function getLearnerCount(): Promise<number> {
  const [row] = await db.select({ total: count() }).from(user);
  return LEARNER_BASE + (row?.total ?? 0);
}
