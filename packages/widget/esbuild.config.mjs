import { build } from "esbuild";

const result = await build({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: "../../apps/web/public/widget.js",
  format: "iife",
  globalName: "PortfolioWidget",
  target: "es2020",
  minify: true,
  jsx: "automatic",
  jsxImportSource: "preact",
  alias: { react: "preact/compat", "react-dom": "preact/compat" },
  define: { "process.env.NODE_ENV": '"production"' },
  metafile: true,
});
console.error("[widget] built");
