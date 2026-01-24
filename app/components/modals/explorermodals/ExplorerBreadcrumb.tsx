'use client';

type Props = {
  path: string[];
  onNavigate: (nextPath: string[]) => void;
};

export default function ExplorerBreadcrumb({
  path,
  onNavigate,
}: Props) {
  return (
    <nav className="flex items-center gap-1 text-sm min-w-0">
      {/* ROOT */}
      <button
        onClick={() => onNavigate([])}
        className="
          text-muted-foreground
          hover:underline
          shrink-0
        "
      >
        /
      </button>

      {path.map((segment, index) => {
        const isLast = index === path.length - 1;

        return (
          <div
            key={`${segment}-${index}`}
            className="flex items-center gap-1 min-w-0"
          >
            <span className="text-muted-foreground">/</span>

            {isLast ? (
              <span
                className="
                  font-medium
                  truncate
                  max-w-[200px]
                "
                title={segment}
              >
                {segment}
              </span>
            ) : (
              <button
                onClick={() =>
                  onNavigate(path.slice(0, index + 1))
                }
                className="
                  hover:underline
                  truncate
                  max-w-[200px]
                "
                title={segment}
              >
                {segment}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
