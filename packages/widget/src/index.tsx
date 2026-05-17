import { h, render } from "preact";
import { useState } from "preact/hooks";

const WIDGET_HOST =
  (document.currentScript as HTMLScriptElement | null)?.src?.replace(/\/widget\.js.*$/, "") ??
  "https://talk-to-my-portfolio.vercel.app";

// Portfolio palette (neryc.github.io/nery-cano-portfolio):
//   --accent      #2E75B6 (primary blue)
//   --accent-light #4FA9E8 (hover)
//   --bg-deep     #06101F (deep navy, iframe bg)
// Keeping these as literals (not CSS vars) because this script runs in the
// HOST page where those vars don't exist.
const COLOR_ACCENT = "#2E75B6";
const COLOR_ACCENT_HOVER = "#4FA9E8";
const COLOR_PANEL_BG = "#06101F";

function FAB() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 999999,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {open && (
        <div
          style={{
            width: 380,
            height: 560,
            marginBottom: 12,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow:
              "0 20px 40px -8px rgba(6,16,31,0.55), 0 8px 16px -4px rgba(46,117,182,0.25)",
            background: COLOR_PANEL_BG,
            border: "1px solid rgba(148, 163, 184, 0.14)",
          }}
        >
          <iframe
            src={`${WIDGET_HOST}/widget`}
            style={{ width: "100%", height: "100%", border: 0, background: COLOR_PANEL_BG }}
            title="Chat with Nery's portfolio"
          />
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          background: hover ? COLOR_ACCENT_HOVER : COLOR_ACCENT,
          color: "#fff",
          border: 0,
          cursor: "pointer",
          fontSize: 22,
          boxShadow:
            "0 10px 24px -4px rgba(46,117,182,0.55), 0 4px 8px -2px rgba(6,16,31,0.45)",
          transition: "background 0.18s ease, transform 0.18s ease",
          transform: hover ? "translateY(-1px)" : "translateY(0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label={open ? "Close chat" : "Chat with Nery's portfolio"}
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}

const mount = document.createElement("div");
mount.id = "portfolio-widget-root";
document.body.appendChild(mount);
render(<FAB />, mount);
