"use client";

import { useState } from "react";
import BlobModal from "@/components/searchwallet/BlobModal";
import { Database, Clock, Eye, ArrowRight } from "lucide-react";

type Blob = {
  txHash: string;
  size: number;
  timestamp: string;
  data: string;
};

export default function BlobTable({ blobs }: { blobs: Blob[] }) {
  const [selected, setSelected] = useState<Blob | null>(null);

  if (!blobs.length) {
    return (
      <div className="mt-8 p-8 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
        <Database className="w-12 h-12 mx-auto mb-4 text-white/20" />
        <p className="text-sm text-white/60">
          No blobs found for this wallet
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-4 h-4 text-purple-400" />
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
          Blobs
        </h2>
        <span className="text-xs text-white/40">({blobs.length})</span>
      </div>

      <div className="grid gap-3">
        {blobs.map((blob) => (
          <div 
            key={blob.txHash}
            className="
              group
              relative
              p-4
              rounded-xl
              bg-white/[0.03]
              border border-white/[0.06]
              hover:bg-white/[0.06]
              hover:border-white/[0.1]
              transition-all
              cursor-pointer
            "
            onClick={() => setSelected(blob)}
          >
            <div className="flex items-center gap-4">
              {/* ICON */}
              <div className="
                w-10 h-10 
                rounded-lg 
                bg-purple-500/10 
                flex items-center justify-center
                border border-purple-500/20
              ">
                <Database className="w-5 h-5 text-purple-400" />
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-white/50 truncate">
                  {blob.txHash.slice(0, 20)}...{blob.txHash.slice(-8)}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    {blob.size.toLocaleString()} bytes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {blob.timestamp}
                  </span>
                </div>
              </div>

              {/* VIEW BUTTON */}
              <button
                className="
                  flex items-center gap-1
                  px-4 py-2 
                  rounded-lg 
                  text-xs font-medium
                  bg-purple-500/20 hover:bg-purple-500/30
                  text-purple-300 hover:text-purple-200
                  transition-colors
                "
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(blob);
                }}
              >
                <Eye className="w-3 h-3" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <BlobModal blob={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
