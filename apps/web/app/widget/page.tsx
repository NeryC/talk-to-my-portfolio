"use client";

import { ChatShell } from "@/components/chat/ChatShell";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function WidgetInner() {
  const params = useSearchParams();
  const theme = params.get("theme");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-transparent">
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
