"use client";

type Props = {
  connected: boolean;
  onConnect: () => void;
};

export default function Header({ connected, onConnect }: Props) {
  return (
    <header className="flex items-center justify-between px-8 py-6">
      <h1 className="text-lg font-semibold tracking-wide">
        Shelby Drop
      </h1>

      <button
        onClick={onConnect}
        className="
          px-4 py-2 rounded-lg text-sm
          bg-white/10 hover:bg-white/20
        "
      >
        {connected ? "Connected 🦊" : "Connect 🦊"}
      </button>
    </header>
  );
}
