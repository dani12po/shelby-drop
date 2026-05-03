"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] text-center p-6 gap-4">
        <div className="text-5xl mb-2">🔗</div>
        <h2 className="text-xl font-bold">Link not found or expired</h2>
        <p className="text-[var(--text-secondary)] max-w-md">
          This share link may have expired or doesn't exist.
        </p>
        <Link
          href="/"
          className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
      <p className="text-[var(--text-secondary)] font-medium">Opening shared file…</p>
    </div>
  );
}
