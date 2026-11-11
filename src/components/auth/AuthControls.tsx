"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GLASS } from "@/components/ui/glass";
import { authClient } from "@/lib/auth-client";
import { lessonCopy } from "@/lib/lessonCopy";
import { cn } from "@/lib/utils";

const PILL = cn(
  "flex h-10 items-center rounded-ui px-4 text-[15px] font-medium text-white/80 transition-colors hover:text-white",
  GLASS,
);

export function AuthControls({ size = "nav" }: { size?: "nav" | "bar" }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const height = size === "bar" ? "h-12" : "h-10";
  const text = lessonCopy.auth.nav;

  if (isPending) {
    return null;
  }

  if (!session) {
    return (
      <Link href="/login" className={cn(PILL, height)}>
        {text.login}
      </Link>
    );
  }

  const logout = async () => {
    setSigningOut(true);
    await authClient.signOut();
    setSigningOut(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <Link href="/profile" className={cn(PILL, height)} title={session.user.email}>
        {session.user.name || text.profile}
      </Link>
      <button type="button" onClick={logout} disabled={signingOut} className={cn(PILL, height, "disabled:opacity-50")}>
        {signingOut ? text.loggingOut : text.logout}
      </button>
    </div>
  );
}
