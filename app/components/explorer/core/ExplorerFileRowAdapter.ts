import type { ExplorerItem } from '@/types/explorer';

/**
 * UI Row Model
 * ------------
 * BUKAN domain entity
 */
export type ExplorerRowModel =
  | ExplorerFileRowModel
  | ExplorerFolderRowModel;

interface ExplorerRowBase {
  id: string;
  name: string;
  path: string;
  kind: 'file' | 'folder';
  isSelected: boolean;
}

export interface ExplorerFileRowModel extends ExplorerRowBase {
  kind: 'file';
  size: number;
  mimeType: string;
  canPreview: boolean;
}

export interface ExplorerFolderRowModel extends ExplorerRowBase {
  kind: 'folder';
  childrenCount?: number;
}

/**
 * Pure adapter
 * ------------
 * - NO JSX
 * - NO React
 * - NO side effects
 */
export function adaptExplorerItemToRow(
  item: ExplorerItem,
  options?: {
    selectedIds?: Set<string>;
  }
): ExplorerRowModel {
  const isSelected = options?.selectedIds?.has(item.id) ?? false;

  switch (item.kind) {
    case 'file':
      return {
        id: item.id,
        name: item.name,
        path: item.path,
        kind: 'file',

        size: item.size,
        mimeType: item.mimeType,
        canPreview: isPreviewableMime(item.mimeType),

        isSelected,
      };

    case 'folder':
      return {
        id: item.id,
        name: item.name,
        path: item.path,
        kind: 'folder',

        childrenCount: item.childrenCount,
        isSelected,
      };

    default:
      return assertNever(item);
  }
}

/**
 * Internal helpers
 */

function isPreviewableMime(mimeType: string): boolean {
  return (
    mimeType.startsWith('image/') ||
    mimeType.startsWith('video/') ||
    mimeType === 'application/pdf'
  );
}

function assertNever(value: never): never {
  throw new Error('Unhandled ExplorerItem kind');
}
