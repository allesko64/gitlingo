import { copy } from "@/lib/landing/copy";
import { Container } from "../../layout/Container";
import { HillEdge } from "../HillEdge";
import { SectionHeader } from "../SectionHeader";
import { LazyFourZones } from "./FourZonesLazy";

export function FourZonesSection() {
  const text = copy.fourZones;

  return (
    <section
      id="four-zones"
      aria-labelledby="four-zones-title"
      className="landing-section relative scroll-mt-24 overflow-x-clip bg-navy"
    >
      <HillEdge />
      <Container>
        <SectionHeader id="four-zones-title" label={text.label} title={text.title} sub={text.sub} />
        <div className="mt-12">
          <LazyFourZones />
        </div>
      </Container>
    </section>
  );
}
