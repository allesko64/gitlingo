import { ImageResponse } from "next/og";

export const alt = "Git Lingo — Learn git by actually using it";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #0a1230 0%, #0f1b3d 45%, #16265a 100%)",
          padding: 72,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#ffffff",
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              border: "2px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7c93ff",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            git
          </div>
          Git Lingo
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 64,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            Learn git by actually using it.
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: 28,
              lineHeight: 1.35,
              maxWidth: 820,
            }}
          >
            Type real commands. Watch your files move. No setup needed.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "rgba(255,255,255,0.55)",
            fontSize: 22,
          }}
        >
          <span>gitlingo.ayushlabs.tech</span>
          <span
            style={{
              color: "#0f1b3d",
              background: "#ff3d8b",
              padding: "12px 22px",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 22,
            }}
          >
            Start level 1
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
