import Link from "next/link";
import { copy } from "@/lib/landing/copy";
import { Container } from "../layout/Container";
import { Grid } from "../layout/Grid";
import { BranchIcon } from "./PixelIcons";

const LINK = "rounded-ui py-2 text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline";

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

          <p className="col-span-12 text-center text-sm text-white/50 md:col-span-4 md:text-right">
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
        </Grid>
      </Container>
    </footer>
  );
}
