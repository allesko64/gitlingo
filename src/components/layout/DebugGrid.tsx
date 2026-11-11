"use client";

import { useEffect, useState } from "react";
import { Container } from "./Container";
import { Grid } from "./Grid";

export function DebugGrid() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "g" ||
        event.repeat || event.ctrlKey || event.metaKey || event.altKey ||
        (event.target instanceof Element && event.target.closest(
          "input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='textbox']",
        ))
      ) {
        return;
      }
      setVisible((value) => !value);
    };
    window.addEventListener("keydown", toggle);
    return () => window.removeEventListener("keydown", toggle);
  }, []);

  if (!visible) return null;

  return (
    <div aria-hidden="true" data-grid-overlay className="pointer-events-none fixed inset-0 z-[128]">
      <Container className="h-full">
        <Grid className="h-full">
          {Array.from({ length: 12 }, (_, column) => (
            <div key={column} className="border-x border-white/10 bg-white/5" />
          ))}
        </Grid>
      </Container>
    </div>
  );
}
