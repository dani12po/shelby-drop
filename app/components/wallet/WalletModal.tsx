"use client";

import { motion, AnimatePresence } from "framer-motion";

type WalletModalProps = {
  open: boolean;
  wallets: string[];
  onSelectWallet: (name: string) => void;
  onClose: () => void;
};

const WALLET_ICONS: Record<string, JSX.Element> = {
  Petra: <span className="h-3 w-3 rounded-full bg-purple-500" />,
  OKX: <span className="h-3 w-3 rounded-full bg-white" />,
  Martian: <span className="h-3 w-3 rounded-full bg-green-400" />,
  Backpack: <span className="h-3 w-3 rounded-full bg-orange-400" />,
};

const RECOMMENDED_WALLET = "Petra";

export default function WalletModal({
  open,
  wallets,
  onSelectWallet,
  onClose,
}: WalletModalProps) {
  // Petra pinned on top, others always appended below
  const orderedWallets = [
    ...wallets.filter((w) => w === RECOMMENDED_WALLET),
    ...wallets.filter((w) => w !== RECOMMENDED_WALLET),
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP — CLICK OUTSIDE TO CLOSE */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MODAL BORDER */}
          <motion.div
            className="
              fixed z-50
              top-1/2 left-1/2
              -translate-x-1/2 -translate-y-1/2
              rounded-[26px]
              p-[2px]
            "
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              background: `
                linear-gradient(
                  90deg,
                  #7dd3fc,
                  #a78bfa,
                  #f472b6,
                  #34d399,
                  #fbbf24,
                  #60a5fa,
                  #a78bfa
                )
              `,
              backgroundSize: "400% 100%",
              animation: "walletBorder 36s linear infinite",
            }}
          >
            {/* SOLID MODAL */}
            <div
              className="
                w-[375px]
                rounded-[26px]
                bg-[#0b0f14]
                shadow-[0_20px_80px_rgba(0,0,0,0.65)]
              "
            >
              {/* ⬇️ SPACING FIX HERE */}
              <div className="px-6 py-[22px]">
                {/* HEADER */}
                <h2 className="text-[16.2px] font-semibold text-white text-center mb-[18px]">
                  Connect Wallet
                </h2>

                {/* WALLET LIST */}
                <div className="flex flex-col items-center">
                  {orderedWallets.map((name, idx) => {
                    const isRecommended =
                      name === RECOMMENDED_WALLET;

                    return (
                      <div
                        key={name}
                        className="group relative w-full flex justify-center"
                        style={{
                          marginBottom:
                            idx === orderedWallets.length - 1
                              ? "0"
                              : "6px",
                        }}
                      >
                        {/* HOVER GRADIENT BORDER */}
                        <div
                          className="
                            absolute inset-0
                            rounded-full
                            p-[1.5px]
                            opacity-0
                            group-hover:opacity-100
                            transition-opacity
                          "
                          style={{
                            background: `
                              linear-gradient(
                                90deg,
                                #7dd3fc,
                                #a78bfa,
                                #f472b6,
                                #34d399,
                                #fbbf24,
                                #60a5fa,
                                #a78bfa
                              )
                            `,
                            backgroundSize: "400% 100%",
                            animation: "walletBorder 28s linear infinite",
                          }}
                        />

                        <button
                          onClick={() => onSelectWallet(name)}
                          className={`
                            relative z-10
                            flex items-center gap-4
                            px-4 py-2.5
                            w-[70%]
                            rounded-full
                            text-sm
                            transition
                            ${
                              isRecommended
                                ? "bg-purple-500/15 border border-purple-400/40"
                                : "bg-white/5 hover:bg-white/10 border border-white/10"
                            }
                          `}
                        >
                          {/* ICON */}
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                            {WALLET_ICONS[name]}
                          </div>

                          {/* NAME */}
                          <span className="flex-1 text-left font-medium text-white">
                            {name}
                          </span>

                          {/* RECOMMENDED TEXT */}
                          {isRecommended && (
                            <span className="text-[10px] text-purple-300">
                              Recommended
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
