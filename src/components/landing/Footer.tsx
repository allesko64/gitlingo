import Link from "next/link";
import { copy } from "@/lib/landing/copy";
import { Container } from "../layout/Container";
import { Grid } from "../layout/Grid";
import { GithubLogo, XLogo } from "@phosphor-icons/react/dist/ssr";
import { BranchIcon } from "./PixelIcons";

const LINK = "rounded-ui py-2 text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline";

const ICONS = { x: XLogo, github: GithubLogo } as const;

export function Footer() {
  const text = copy.footer;

  return (
    <footer className="landing-section bg-navy-deep">
      <Container>
        <Grid className="items-center">
          <Link href="/" className="col-span-12 flex w-fit items-center gap-2 justify-self-center rounded-ui text-lg font-medium text-white md:col-span-4 md:justify-self-start">
            <BranchIcon className="size-4" />
            {copy.nav.wordmark}
          </Link>

          <nav aria-label="Footer" className="col-span-12 justify-self-center md:col-span-4">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              {text.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={LINK}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:col-span-4 md:justify-end">
            <p className="text-sm text-white/50">
              {text.builtBy}{" "}
              <a
                href={text.authorHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={text.authorLabel}
                className="rounded-ui py-2 text-white/70 underline underline-offset-4 transition-colors hover:text-white"
              >
                {text.author}
              </a>
            </p>
            <ul className="flex items-center gap-1">
              {text.social.map((item) => {
                const Icon = ICONS[item.icon];
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      title={item.label}
                      className="flex size-10 items-center justify-center rounded-ui text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Icon size={20} weight="fill" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </Grid>
      </Container>
    </footer>
  );
}
