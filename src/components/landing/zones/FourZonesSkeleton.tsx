import { FOUR_ZONES_SCRIPT } from "@/lib/landing/fourZonesScript";
import { Board } from "./Board";
import { Controls } from "./Controls";
import { StoryText } from "./StoryText";

export function FourZonesSkeleton() {
  const first = FOUR_ZONES_SCRIPT[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="order-1 lg:order-2">
        <StoryText step={first} typed="" />
      </div>
      <div className="order-2 lg:order-1">
        <Board state={first.state} activeArrow={null} />
      </div>
      <div className="order-3">
        <Controls step={0} total={FOUR_ZONES_SCRIPT.length} canBack={false} canNext />
      </div>
    </div>
  );
}
