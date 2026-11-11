type PostHogLike = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
};

export function track(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined") {
    return;
  }
  const posthog = (window as unknown as { posthog?: PostHogLike }).posthog;
  posthog?.capture(event, properties);
}
