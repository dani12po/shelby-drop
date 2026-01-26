import type { MetadataTabProps } from "../metadata.types";

export default function MetadataAccessTab({
  file,
  wallet,
}: MetadataTabProps) {
  return (
    <div className="space-y-3 text-sm">
      <AccessRow label="Owner" value="You" />
      <AccessRow label="Visibility" value="Private" />
      <AccessRow label="Share Link" value="Disabled" />

      <div className="text-xs text-white/30 pt-2">
        Access editing coming soon
      </div>
    </div>
  );
}

function AccessRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-white/40">
        {label}
      </span>
      <span className="text-white/80">
        {value}
      </span>
    </div>
  );
}
