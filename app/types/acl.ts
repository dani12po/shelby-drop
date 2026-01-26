import type {
  ExplorerPermissionMap,
} from "@/components/explorer/context-menu/permissions";
import type { ExplorerRole } from "./role";

export type ExplorerAclEntry = {
  role: ExplorerRole;
  allow?: Partial<ExplorerPermissionMap>;
  deny?: Partial<ExplorerPermissionMap>;
};

export type ExplorerAcl = ExplorerAclEntry[];
