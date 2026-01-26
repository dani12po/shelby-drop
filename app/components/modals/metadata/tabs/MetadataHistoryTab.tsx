import type { MetadataTabProps } from "../metadata.types";

export default function MetadataHistoryTab({
  file,
  wallet,
}: MetadataTabProps) {
  return (
    <div className="text-sm text-white/50">
      No activity recorded yet.
    </div>
  );
}
