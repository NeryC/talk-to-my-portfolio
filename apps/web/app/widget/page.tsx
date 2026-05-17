"use client";

import { ChatShell } from "@/components/chat/ChatShell";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function WidgetInner() {
  const params = useSearchParams();
  const theme = params.get("theme");

  useEffect(() => {
    // Default to dark to match the portfolio at neryc.github.io. Explicit
    // ?theme=light opts back into the light shadcn defaults for embedders
    // that want it.
    const useDark = theme !== "light";
    const root = document.documentElement;
    if (useDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
      <ChatShell mode="widget" />
    </div>
  );
}

export default function WidgetPage() {
  return (
    <Suspense fallback={null}>
      <WidgetInner />
    </Suspense>
  );
}
