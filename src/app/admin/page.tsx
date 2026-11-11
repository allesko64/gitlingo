import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/layout/Container";
import { AppTopBar } from "@/components/lesson/AppTopBar";
import { getAdminData } from "@/lib/adminData";
import { requireAdmin } from "@/lib/dal";
import { lessonCopy } from "@/lib/lessonCopy";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const text = lessonCopy.admin;

const date = (value: Date) => value.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" });

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="card-surface rounded-card border border-white/10 p-5">
      <p className="font-pixel text-[10px] tracking-wide text-white/50">{label}</p>
      <p className="mt-2 font-mono text-3xl tabular-nums text-white">{value}</p>
      {note !== undefined && <p className="mt-1 text-sm text-white/50">{note}</p>}
    </div>
  );
}

async function AdminContent() {
  await requireAdmin();
  const data = await getAdminData();
  const rate = data.total === 0 ? 0 : Math.round((data.started / data.total) * 100);
  const biggest = Math.max(1, ...data.perLevel.map((level) => level.learners));

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label={text.stats.users} value={data.total} />
        <Stat label={text.stats.started} value={data.started} note={`${rate}% of users`} />
        <Stat label={text.stats.finished} value={data.finishedAll} note={`all ${data.levels} levels`} />
        <Stat label={text.stats.completions} value={data.completions} />
      </div>

      <h2 className="mt-12 text-xl font-medium text-white">{text.perLevel}</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {data.perLevel.map((level) => (
          <li key={level.number} className="grid grid-cols-[minmax(0,160px)_1fr_auto] items-center gap-4 text-sm">
            <span className="truncate text-white/80">
              {level.number}. {level.title}
            </span>
            <span className="h-2 rounded-full bg-white/10">
              <span
                className="block h-2 rounded-full bg-periwinkle"
                style={{ width: `${(level.learners / biggest) * 100}%` }}
              />
            </span>
            <span className="font-mono tabular-nums text-white/70">{level.learners}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-xl font-medium text-white">{text.users}</h2>
      <div className="no-visible-scrollbar mt-4 overflow-x-auto rounded-card border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/5 font-pixel text-[10px] tracking-wide text-white/50">
            <tr>
              {text.columns.map((column) => (
                <th key={column} scope="col" className="px-4 py-3 font-normal">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {data.users.map((person) => (
              <tr key={person.id}>
                <td className="px-4 py-3 text-white">{person.name}</td>
                <td className="px-4 py-3 text-white/70">{person.email}</td>
                <td className="px-4 py-3 text-white/70">{date(person.joined)}</td>
                <td className="px-4 py-3 text-white">
                  {person.level === null ? text.allDone : `${person.level}. ${person.levelTitle}`}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-white/70">
                  {person.completed} / {data.levels}
                </td>
                <td className="px-4 py-3 text-white/70">{person.lastActive ? date(person.lastActive) : "—"}</td>
              </tr>
            ))}
            {data.users.length === 0 && (
              <tr>
                <td colSpan={text.columns.length} className="px-4 py-6 text-center text-white/50">
                  {text.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function AdminPage() {
  return (
    <>
      <AppTopBar />
      <main className="flex-1 pt-32 pb-24">
        <Container>
          <p className="font-pixel text-xs tracking-wide text-white/50">{text.label}</p>
          <h1 className="mt-3 mb-8 text-[32px] font-normal leading-[1.1] tracking-[-0.02em] text-white lg:text-[40px]">
            {text.title}
          </h1>
          <Suspense fallback={<p className="text-white/50">{text.loading}</p>}>
            <AdminContent />
          </Suspense>
        </Container>
      </main>
      <Footer />
    </>
  );
}
