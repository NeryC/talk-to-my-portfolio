import { Loader2 } from "lucide-react";

interface Props {
  message?: string;
}

export function SamplingIndicator({
  message = "Your LLM is generating a personalized response…",
}: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
    >
      <Loader2 className="size-3 animate-spin" />
      {message}
    </div>
  );
}
