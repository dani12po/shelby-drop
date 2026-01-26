
import type { LucideIcon } from "lucide-react";
import type { ContextMenuContext } from "./context";

export type ContextMenuAction = {
  id: string;
  label: string;
  icon?: LucideIcon;
  danger?: boolean;
  isAllowed: (ctx: ContextMenuContext) => boolean;
  onSelect: (ctx: ContextMenuContext) => void;
};
