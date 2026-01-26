
import type { ContextMenuContext } from "./context";
import type { ExplorerPermission } from "./permissions";

export function requirePermission(permission: ExplorerPermission) {
  return (ctx: ContextMenuContext): boolean =>
    ctx.permissions?.[permission] === true;
}

export function singleSelection(ctx: ContextMenuContext): boolean {
  return ctx.isSingle;
}

export function allFiles(ctx: ContextMenuContext): boolean {
  return ctx.items.every((i: any) => i.type === "file");
}

export function allFolders(ctx: ContextMenuContext): boolean {
  return ctx.items.every((i: any) => i.type === "folder");
}
