"use client";

type Props = {
  connected?: boolean;
  onConnect?: () => void;
};

export default function Header({
  connected,
  onConnect,
}: Props) {
  return (
    <header
      className="
        flex items-center justify-between
        px-8 py-4
        bg-black/20 backdrop-blur
      "
    >
      {/* LEFT : BRAND */}
      <h1 className="text-sm font-semibold tracking-wide text-white/90">
          
      </h1>

      {/* RIGHT : CONNECT WALLET */}
      {onConnect && (
        <button
          onClick={onConnect}
          className="
            px-3 py-1.5 rounded-md
            bg-white/10 hover:bg-white/20
            transition
            text-xs text-white
          "
        >
          {connected ? "Connected" : "Connect Wallet"}
        </button>
      )}
    </header>
  );
}
