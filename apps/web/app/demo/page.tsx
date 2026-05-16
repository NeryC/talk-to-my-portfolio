"use client";

import { ChatShell } from "@/components/chat/ChatShell";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const CHIPS = [
  "Show me his AI projects",
  "Does he know Kubernetes?",
  "Schedule a 30-min intro",
];

export default function DemoPage() {
  const [initial, setInitial] = useState<string | undefined>();
  const [started, setStarted] = useState(false);

  const start = (text: string) => {
    setInitial(text);
    setStarted(true);
  };

  return (
    <main className="flex h-[100dvh] flex-1 flex-col">
      {!started ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
          <h1 className="text-2xl font-semibold">Talk to my portfolio</h1>
          <p className="max-w-md text-center text-sm text-muted-foreground">
            Try a prompt to start the conversation. The agent has access to
            Albert&apos;s portfolio MCP server and can answer questions, surface
            projects, or book a meeting.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {CHIPS.map((chip) => (
              <Button
                key={chip}
                size="sm"
                variant="outline"
                onClick={() => start(chip)}
              >
                {chip}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <ChatShell mode="demo" initialMessage={initial} />
      )}
    </main>
  );
}
