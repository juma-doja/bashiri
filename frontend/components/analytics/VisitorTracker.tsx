"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackVisit } from "@/lib/api/client";

const VISITOR_KEY = "bashiri-visitor-key";

function getVisitorKey() {
  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;
  const key = window.crypto.randomUUID();
  window.localStorage.setItem(VISITOR_KEY, key);
  return key;
}

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    trackVisit(getVisitorKey(), pathname).catch(() => undefined);
  }, [pathname]);

  return null;
}