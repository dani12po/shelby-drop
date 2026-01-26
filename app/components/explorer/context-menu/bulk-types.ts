import type { ExplorerItem } from "@/types/explorer";

export type BulkContextMenuAction = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;

  /**
   * Apakah action valid untuk kombinasi item ini
   */
  supports: (items: ExplorerItem[]) => boolean;

  /**
   * Eksekusi bulk
   */
  onSelect: (items: ExplorerItem[]) => void;
};
