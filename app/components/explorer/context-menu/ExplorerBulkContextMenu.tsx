"use client";

import { motion } from "framer-motion";
import type { ContextMenuContext } from "./context";
import { getContextMenuActions } from "./getContextMenuActions";

/* ===============================
   PROPS
================================ */
type Props = {
  x: number;
  y: number;
  ctx: ContextMenuContext;
  onClose: () => void;
};

/* ===============================
   COMPONENT
================================ */
export default function ExplorerBulkContextMenu({
  x,
  y,
  ctx,
  onClose,
}: Props) {
  const actions = getContextMenuActions(ctx);

  function stop(e: React.MouseEvent) {
    e.stopPropagation();
  }

  function itemClass(
    danger?: boolean
  ): string {
    return `
      w-full text-left
      px-4 py-2
      text-sm
      transition
      ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "hover:bg-white/10"
      }
    `;
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="fixed z-[10000]"
      style={{ top: y, left: x }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onClick={onClose}
      onContextMenu={(e) =>
        e.preventDefault()
      }
    >
      {/* GRADIENT BORDER */}
      <div
        className="rounded-xl p-[1px]"
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
          animation:
            "walletBorder 28s linear infinite",
        }}
      >
        {/* MENU */}
        <div
          className="
            min-w-[220px]
            rounded-xl
            bg-[#0b0f14]/95
            backdrop-blur-xl
            shadow-[0_20px_60px_rgba(0,0,0,0.6)]
            py-1
          "
        >
          {/* HEADER */}
          <div className="px-4 py-1 text-xs text-white/50">
            {ctx.items.length} items selected
          </div>

          {/* ACTIONS */}
          {actions.map((action) => (
            <button
              key={action.id}
              className={itemClass(
                action.danger
              )}
              onClick={(e) => {
                stop(e);
                action.onSelect(ctx);
                onClose();
              }}
            >
              <div className="flex items-center gap-2">
                {action.icon && (
                  <action.icon size={14} />
                )}
                <span>{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
