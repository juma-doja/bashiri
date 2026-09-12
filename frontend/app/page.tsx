"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/app/landing/page";

const BashiriSplash = dynamic(
  () => import("@/components/splash/BashiriSplash").then((m) => m.BashiriSplash),
  { ssr: false }
);

const LANDING_KEY = "bashiri_landing_seen";

export default function RootPage() {
  const router = useRouter();
  const [view, setView] = useState<"loading" | "landing" | "splash" | "home">("loading");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isPWA =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isPWA) {
      setView("splash");
      return;
    }

    const seenLanding = window.localStorage.getItem(LANDING_KEY) === "1";

    if (seenLanding) {
      setView("home");
      router.replace("/home");
      return;
    }

    window.localStorage.setItem(LANDING_KEY, "1");
    setView("landing");
  }, [router]);

  if (view === "loading") {
    return <div className="fixed inset-0 bg-black" aria-hidden="true" />;
  }

  if (view === "splash") {
    return <BashiriSplash />;
  }

  if (view === "landing") {
    return <LandingPage />;
  }

  return null;
}
