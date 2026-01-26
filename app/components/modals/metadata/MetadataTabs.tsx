import type { MetadataTabKey } from "./metadata.types";

type Props = {
  active: MetadataTabKey;
  onChange: (tab: MetadataTabKey) => void;
};

const tabs: MetadataTabKey[] = [
  "info",
  "access",
  "history",
];

export default function MetadataTabs({
  active,
  onChange,
}: Props) {
  return (
    <div className="flex gap-1 mb-4">
      {tabs.map((tab) => {
        const isActive = active === tab;

        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`
              flex-1 px-3 py-1.5 rounded-md text-xs capitalize
              transition
              ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
