"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SharePageProps {
  params: Promise<{ code: string }>;
}

export default function SharePage({ params }: SharePageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "notfound">("loading");

  useEffect(() => {
    let cancelled = false;

    params.then(async ({ code }) => {
      if (cancelled) return;

      // 1. Try Vercel KV backend first (cross-device shares)
      try {
        const res = await fetch(`/api/share?code=${encodeURIComponent(code)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.target) {
            window.location.href = data.target;
            return;
          }
        }
      } catch {
        // KV not available, fall through
      }

      // 2. Try localStorage (same-device shares from shareService)
      try {
        const { getShareMapping } = await import("../lib/share/shareService");
        const mapping = getShareMapping(code);
        if (mapping) {
          const url = new URL("/", window.location.origin);
          url.searchParams.set("share", code);
          url.searchParams.set("wallet", mapping.wallet);
          url.searchParams.set("file", mapping.filename);
          window.location.href = url.toString();
          return;
        }
      } catch {
        // shareService not available
      }

      // 3. Not found
      if (!cancelled) setStatus("notfound");
    });

    return () => { cancelled = true; };
  }, [params, router]);

  if (status === "notfound") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-primary)", color: "var(--text-primary)",
        flexDirection: "column", gap: "16px", textAlign: "center", padding: "24px",
      }}>
        <div style={{ fontSize: "3rem" }}>🔗</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Link not found or expired</h2>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
          This share link may have expired or doesn&apos;t exist.
        </p>
        <a
          href="/"
          style={{
            padding: "10px 24px", borderRadius: "8px",
            background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
            color: "white", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem",
          }}
        >
          Go Home
        </a>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg-primary)", color: "var(--text-primary)",
      flexDirection: "column", gap: "16px",
    }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%",
        border: "3px solid rgba(139,92,246,0.3)", borderTopColor: "#8b5cf6",
        animation: "spin 1s linear infinite",
      }} />
      <p style={{ color: "var(--text-secondary)", margin: 0 }}>Opening shared file…</p>
    </div>
  );
}
