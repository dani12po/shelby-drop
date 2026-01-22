"use client";

import { useState } from "react";

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [lockDays, setLockDays] = useState(3);

  return (
    <div className="w-full max-w-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
      <input
        type="file"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
        className="block w-full text-sm"
      />

      {file && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400">
            Lock days (min 3):
          </label>

          <input
            type="number"
            min={3}
            value={lockDays}
            onChange={(e) =>
              setLockDays(Number(e.target.value))
            }
            className="
              w-24 px-3 py-2 rounded-lg
              bg-white/10 border border-white/10
              focus:outline-none
            "
          />
        </div>
      )}

      <button
        disabled={!file || lockDays < 3}
        className="
          w-full py-3 rounded-xl
          bg-indigo-600 hover:bg-indigo-700
          disabled:opacity-40
        "
      >
        Upload
      </button>
    </div>
  );
}
