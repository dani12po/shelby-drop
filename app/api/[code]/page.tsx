"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ShortLinkPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  useEffect(() => {
    async function resolve() {
      const res = await fetch(
        `/api/share?code=${code}`
      );

      if (!res.ok) {
        router.replace("/");
        return;
      }

      const data = await res.json();
      router.replace(data.target);
    }

    resolve();
  }, [code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400 text-sm">
      Resolving shared link…
    </div>
  );
}
