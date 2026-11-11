import Link from "next/link";
import { AuthControls } from "../auth/AuthControls";
import { Container } from "../layout/Container";
import { copy } from "@/lib/landing/copy";
import { lessonCopy } from "@/lib/lessonCopy";
import { cn } from "@/lib/utils";
import { BranchIcon } from "../landing/PixelIcons";
import { GLASS } from "../ui/glass";

export function AppTopBar() {
  return (
    <header className="fixed inset-x-0 top-4 z-50">
      <Container>
      <nav aria-label="Main" className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className={cn(
            "flex h-12 items-center gap-2 rounded-ui px-3 text-lg font-medium leading-none tracking-[-0.02em] text-white",
            GLASS,
          )}
        >
          <BranchIcon className="size-4" />
          {copy.nav.wordmark}
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/lessons"
            className={cn(
              "flex h-12 items-center rounded-ui px-4 text-[15px] font-medium text-white/80 transition-colors hover:text-white",
              GLASS,
            )}
          >
            {lessonCopy.allLevels}
          </Link>
          <AuthControls size="bar" />
        </div>
      </nav>
      </Container>
    </header>
  );
}
