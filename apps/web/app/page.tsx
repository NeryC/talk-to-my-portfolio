import { Button } from "@/components/ui/button";
import Link from "next/link";

const INSTALL_SNIPPET = "npx @neryc/portfolio-mcp";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col items-start gap-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Talk to my portfolio
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          An MCP-powered conversational agent over Albert&apos;s portfolio.
          Ask about projects, skills, or experience — or schedule a chat. Same
          server is installable in Claude Desktop, so the agent and your local
          LLM share the same knowledge base.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/demo">Try the demo</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/widget">Open the widget</Link>
          </Button>
        </div>

        <section className="w-full pt-4">
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Install in Claude Desktop
          </h2>
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <code>{INSTALL_SNIPPET}</code>
          </pre>
        </section>
      </div>
    </main>
  );
}
