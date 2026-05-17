"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface Props {
  onPick: (text: string) => void;
}

const SUGGESTIONS = [
  {
    label: "What's his stack?",
    prompt: "What's Nery's main stack — give me the short version.",
  },
  {
    label: "AI projects",
    prompt: "Show me the AI projects he built and what each one does.",
  },
  {
    label: "Healthcare experience",
    prompt: "Tell me about the 60% documentation cut at the US healthcare platform.",
  },
  {
    label: "Recent Platzi courses",
    prompt: "Which Platzi courses has he finished in 2025 about AI or LLMs?",
  },
];

export function EmptyState({ onPick }: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-5 py-8 text-center">
      <div className="relative">
        <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-primary/20 blur-2xl" />
        <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30">
          <Sparkles className="size-5" />
        </div>
      </div>
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold text-foreground">
          Talk to Nery&apos;s portfolio
        </h2>
        <p className="max-w-[260px] text-xs leading-relaxed text-muted-foreground">
          Ask about his projects, stack, 164 Platzi certificates, or experience.
          Grounded in real data — no hallucinations.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onPick(s.prompt)}
            className={cn(
              "group flex items-center justify-between gap-2 rounded-lg border border-border bg-card/40 px-3 py-2 text-left text-xs",
              "text-foreground/90 transition-all duration-200",
              "hover:border-primary/40 hover:bg-card hover:text-foreground",
              "hover:shadow-[0_4px_12px_-4px_rgba(46,117,182,0.35)]",
            )}
          >
            <span>{s.label}</span>
            <span className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
