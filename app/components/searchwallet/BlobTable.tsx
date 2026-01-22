import { useState } from "react";
import BlobModal from "@/components/searchwallet/BlobModal";

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
      <p className="mt-6 text-sm text-gray-500">
        No blobs found for this wallet
      </p>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="font-semibold mb-2">Blobs</h2>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Tx Hash</th>
            <th className="p-2 border">Size</th>
            <th className="p-2 border">Timestamp</th>
            <th className="p-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {blobs.map(blob => (
            <tr key={blob.txHash}>
              <td className="p-2 border">{blob.txHash}</td>
              <td className="p-2 border">{blob.size} bytes</td>
              <td className="p-2 border">{blob.timestamp}</td>
              <td className="p-2 border">
                <button
                  className="underline"
                  onClick={() => setSelected(blob)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <BlobModal blob={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
