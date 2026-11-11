"use client";

import { Fragment, useEffect, useState } from "react";
import { copy, FIRST_LEVEL_HREF } from "@/lib/landing/copy";
import { cn } from "@/lib/utils";
import { AuthControls } from "../auth/AuthControls";
import { Container } from "../layout/Container";
import { Button } from "../ui/Button";
import { GLASS_EDGE } from "../ui/glass";
import { BranchIcon } from "./PixelIcons";

export function Navbar() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (hero === null) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50">
      <Container>
        <nav aria-label="Main" className="flex items-center justify-between gap-4">
          <a
            href="#hero"
            className="flex h-10 items-center gap-2 rounded-ui text-[22px] font-medium leading-none tracking-[-0.02em] text-white"
          >
            <BranchIcon className="size-4" />
            {copy.nav.wordmark}
          </a>

          <div className="flex items-center gap-3">
            <ul
              className={cn(
                "hidden items-center rounded-ui transition-[background-color,backdrop-filter] duration-200 md:flex",
                GLASS_EDGE,
                pastHero ? "bg-navy/60 backdrop-blur-lg" : "bg-white/10 backdrop-blur-md",
              )}
            >
              {copy.nav.links.map((link, i) => (
                <Fragment key={link.href}>
                  {i > 0 && <li aria-hidden="true" className="h-4 w-px bg-white/20" />}
                  <li>
                    <a
                      href={link.href}
                      className="block rounded-[8px] px-6 py-3 text-[15px] font-medium leading-none text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                </Fragment>
              ))}
            </ul>

            <AuthControls size="nav" />

            <Button href={FIRST_LEVEL_HREF} size="nav">
              {copy.nav.cta}
            </Button>
          </div>
        </nav>
      </Container>
    </header>
  );
}
