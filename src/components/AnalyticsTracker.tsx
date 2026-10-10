"use client";

import { useEffect } from "react";

export default function AnalyticsTracker() {
  useEffect(() => {
    const send = (section: string) => {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, path: window.location.pathname })
      }).catch(() => undefined);
    };

    send("page");

    const seen = new Set<string>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (entry.isIntersecting && id && !seen.has(id)) {
          seen.add(id);
          send(id);
        }
      });
    }, { threshold: 0.45 });

    document.querySelectorAll("section[id]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return null;
}
