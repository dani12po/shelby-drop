'use client';

type Props = {
  isRoot: boolean;
};

export default function ExplorerEmptyState({
  isRoot,
}: Props) {
  return (
    <div
      className="
        h-full
        flex flex-col
        items-center
        justify-center
        text-center
        gap-2
        px-6
      "
    >
      <div className="text-3xl opacity-60">
        📂
      </div>

      <div className="text-sm font-medium">
        {isRoot
          ? 'No files uploaded yet'
          : 'This folder is empty'}
      </div>

      <div className="text-xs text-muted-foreground max-w-sm">
        {isRoot
          ? 'Upload files to start using your wallet storage.'
          : 'Add files to this folder or navigate back.'}
      </div>
    </div>
  );
}
