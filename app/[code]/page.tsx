"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getShareMapping, type ShareMapping } from "@/lib/share/shareService";

interface SharePageProps {
  params: {
    code: string;
  };
}

export default function SharePage({ params }: SharePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = params.code;
    const mapping = getShareMapping(code);

    if (!mapping) {
      // Share not found or expired, redirect to home
      router.push("/");
      return;
    }

    // Redirect to main app with share parameters
    const url = new URL("/", window.location.origin);
    url.searchParams.set('share', code);
    url.searchParams.set('wallet', mapping.wallet);
    url.searchParams.set('file', mapping.filename);
    
    window.location.href = url.toString();
  }, [params.code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f14] text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p>Opening shared file...</p>
      </div>
    </div>
  );
}
