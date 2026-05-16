"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  server: string;
  className?: string;
}

const SERVER_STYLES: Record<string, string> = {
  portfolio: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  github: "bg-zinc-700/15 text-zinc-700 dark:text-zinc-300",
};

export function McpServerBadge({ server, className }: Props) {
  const palette =
    SERVER_STYLES[server] ?? "bg-sky-500/15 text-sky-700 dark:text-sky-300";
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 gap-1 border-transparent px-2 text-[10px] font-medium uppercase tracking-wide",
        palette,
        className,
      )}
      title={`Tool sourced from the ${server} MCP server`}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {server}
    </Badge>
  );
}
