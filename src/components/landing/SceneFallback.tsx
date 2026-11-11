import { SCENE_COLORS, SKY_RAMP } from "@/lib/landing/sceneConfig";

export function SceneFallback() {
  const stops = SKY_RAMP.map((color, i) => `${color} ${Math.round((i / SKY_RAMP.length) * 80)}%`);
  const background = `linear-gradient(to bottom, ${stops.join(", ")}, ${SCENE_COLORS.farHills} 80%, ${SCENE_COLORS.midHills} 86%, ${SCENE_COLORS.nearField} 92%)`;

  return <div aria-hidden="true" className="absolute inset-0" style={{ background }} />;
}
