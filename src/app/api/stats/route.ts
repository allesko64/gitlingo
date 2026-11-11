import { connection } from "next/server";
import { getLearnerCount } from "@/lib/stats";

export async function GET() {
  await connection();
  try {
    return Response.json({ learners: await getLearnerCount() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
