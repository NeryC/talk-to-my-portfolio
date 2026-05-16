import { h, render } from "preact";
import { useState } from "preact/hooks";

const WIDGET_HOST =
  (document.currentScript as HTMLScriptElement | null)?.src?.replace(/\/widget\.js.*$/, "") ??
  "https://talk-to-my-portfolio.vercel.app";

function FAB() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999999, fontFamily: "system-ui" }}>
      {open && (
        <div
          style={{
            width: 360,
            height: 520,
            marginBottom: 12,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
            background: "#fff",
          }}
        >
          <iframe
            src={`${WIDGET_HOST}/widget?theme=light`}
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          background: "#1F3A68",
          color: "#fff",
          border: 0,
          cursor: "pointer",
          fontSize: 24,
          boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
        }}
        aria-label="Chat with my CV"
      >
        💬
      </button>
    </div>
  );
}

const mount = document.createElement("div");
mount.id = "portfolio-widget-root";
document.body.appendChild(mount);
render(<FAB />, mount);
