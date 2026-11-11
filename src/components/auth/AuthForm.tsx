"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import { lessonCopy } from "@/lib/lessonCopy";
import { readGuestProgress, syncProgress } from "@/lib/useProgress";

type Mode = "login" | "signup";

const INPUT =
  "h-12 w-full rounded-ui border border-white/15 bg-navy-deep/70 px-4 text-base text-white placeholder:text-white/35 transition-colors focus:border-white/40";

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1";

function safeNext(raw: string | null): string {
  return raw !== null && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/lessons";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const text = lessonCopy.auth[mode];
  const fields = lessonCopy.auth.fields;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response =
        mode === "signup"
          ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
          : await authClient.signIn.email({ email: email.trim(), password });

      if (response.error) {
        setError(response.error.message ?? lessonCopy.auth.fallbackError);
        setPending(false);
        return;
      }

      // Merge guest progress before navigation so /profile is not empty on first paint.
      try {
        await syncProgress(readGuestProgress().completed);
      } catch {
        // ProgressSync retries after the session hydrates.
      }

      router.push(next);
      router.refresh();
    } catch {
      setError(lessonCopy.auth.fallbackError);
      setPending(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setGooglePending(true);
    try {
      const response = await authClient.signIn.social({
        provider: "google",
        callbackURL: next,
      });
      if (response.error) {
        setError(response.error.message ?? lessonCopy.auth.fallbackError);
        setGooglePending(false);
      }
      // On success Better Auth redirects to Google; ProgressSync merges guest progress on return.
    } catch {
      setError(lessonCopy.auth.fallbackError);
      setGooglePending(false);
    }
  };

  const switchHref = `${mode === "login" ? "/signup" : "/login"}${next === "/lessons" ? "" : `?next=${encodeURIComponent(next)}`}`;
  const busy = pending || googlePending;

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="card-surface rounded-card border border-white/10 p-6 sm:p-8">
        <p className="font-pixel text-xs tracking-wide text-periwinkle">{text.label}</p>
        <h1 className="mt-2 text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-white sm:text-[32px]">
          {text.title}
        </h1>
        <p className="mt-2 text-[15px] text-white/70">{text.sub}</p>

        {googleEnabled && (
          <div className="mt-6 flex flex-col gap-4">
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={onGoogle}
              icon={<GoogleIcon className="size-5" />}
              className="w-full"
            >
              {googlePending ? lessonCopy.auth.googlePending : lessonCopy.auth.google}
            </Button>
            <div className="flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-white/15" />
              <span className="text-xs tracking-wide text-white/45">{lessonCopy.auth.orEmail}</span>
              <span className="h-px flex-1 bg-white/15" />
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className={`flex flex-col gap-4 ${googleEnabled ? "mt-4" : "mt-6"}`}>
          {mode === "signup" && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-white/80">{fields.name}</span>
              <input
                name="name"
                type="text"
                required
                minLength={2}
                autoComplete="name"
                placeholder={fields.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={INPUT}
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-white/80">{fields.email}</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={fields.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-white/80">{fields.password}</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT}
            />
            {mode === "signup" && <span className="text-xs text-white/50">{fields.passwordHint}</span>}
          </label>

          {error !== null && (
            <p
              role="alert"
              className="rounded-ui border border-pink/40 bg-pink/10 px-3.5 py-2.5 text-sm text-white"
            >
              {error}
            </p>
          )}

          <Button type="submit" disabled={busy} className="mt-2 w-full">
            {pending ? text.pending : text.submit}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/60">
          {text.switchPrompt}{" "}
          <Link href={switchHref} className="font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
            {text.switchLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
