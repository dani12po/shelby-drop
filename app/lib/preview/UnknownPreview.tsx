"use client";

type Props = {
  filename: string;
};

export default function UnknownPreview({
  filename,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-sm text-white/50">
      <div className="text-lg mb-2">📄</div>
      <div className="font-medium">{filename}</div>
      <div className="mt-2 text-xs">
        No preview available for this file type
      </div>
    </div>
  );
}
