
import type { ExplorerItem } from "@/types/explorer";
import type { ContextMenuContext } from "./context";
import type { ExplorerPermissionMap } from "./permissions";
import { createContext } from "./context";

type BuildContextParams = {
  items: ExplorerItem[];
  permissions: ExplorerPermissionMap;
  target?: ExplorerItem;
};

export function buildContextMenuContext(
  params: BuildContextParams
): ContextMenuContext {
  return createContext(params.items as any[], params.permissions, params.target);
}
