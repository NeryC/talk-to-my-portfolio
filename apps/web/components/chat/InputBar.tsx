"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp, Square } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface Props {
  onSubmit: (text: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
  className?: string;
}

export function InputBar({
  onSubmit,
  onStop,
  disabled,
  isStreaming,
  placeholder = "Ask about Nery's projects, skills, courses…",
  className,
}: Props) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSubmit(text);
    setValue("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      className={cn(
        "relative border-t border-border bg-gradient-to-t from-card/40 to-transparent p-3 backdrop-blur-md",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border border-input bg-card/60 px-3 py-2 shadow-inner transition-all",
          "focus-within:border-primary/40 focus-within:bg-card focus-within:shadow-[0_0_0_3px_rgba(46,117,182,0.18)]",
        )}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          disabled={disabled}
          placeholder={placeholder}
          className="min-h-[24px] max-h-32 flex-1 resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-50"
        />
        {isStreaming && onStop ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={onStop}
            aria-label="Stop"
            className="size-8 shrink-0 rounded-full"
          >
            <Square className="size-3" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            onClick={submit}
            disabled={disabled || !value.trim()}
            aria-label="Send"
            className={cn(
              "size-8 shrink-0 rounded-full bg-primary text-primary-foreground transition-all",
              "hover:bg-accent hover:shadow-[0_4px_12px_-4px_rgba(46,117,182,0.6)]",
              "disabled:opacity-40 disabled:shadow-none",
            )}
          >
            <ArrowUp className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
