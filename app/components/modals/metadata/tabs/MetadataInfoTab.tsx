import type { MetadataTabProps } from "../metadata.types";

export default function MetadataInfoTab({
  file,
  wallet,
}: MetadataTabProps) {
  return (
    <div className="space-y-2 text-sm">
      <Row label="Name" value={file.name} />
      <Row label="Size" value={`${file.size} bytes`} />
      <Row label="Type" value={file.mimeType ?? "—"} />
      <Row
        label="Path"
        value={
          Array.isArray(file.path)
            ? file.path.join("/")
            : file.path
        }
      />
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-white/40">
        {label}
      </span>
      <span className="text-white/80 truncate text-right">
        {value}
      </span>
    </div>
  );
}
