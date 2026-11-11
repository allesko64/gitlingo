import { headers } from "next/headers";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { getCompletedIds, knownLessonIds, saveCompleted } from "@/lib/progressDb";

/** Saves guest/local lesson ids for the signed-in user. Prefer this over server actions
 *  from static lesson pages, which can drop cookies and abort mid-flight. */
export async function POST(request: Request) {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const guestIds = Array.isArray((body as { lessonIds?: unknown }).lessonIds)
    ? (body as { lessonIds: unknown[] }).lessonIds
    : [];
  const ids = knownLessonIds(guestIds);
  await saveCompleted(session.user.id, ids);
  const completed = await getCompletedIds(session.user.id);
  return Response.json({ completed }, { headers: { "Cache-Control": "no-store" } });
}
