import { Container } from "./Container";

export function SectionDivider() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative z-20 h-0">
      <Container>
        <div className="relative mx-auto h-px max-w-heading bg-linear-to-r from-transparent via-white/20 to-transparent">
          <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-4 ring-white/30" />
        </div>
      </Container>
    </div>
  );
}
