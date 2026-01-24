'use client';

import { useEffect, useState } from 'react';
import type {
  FolderItem,
  FileItemData,
} from '@/lib/data';
import type { ExplorerItem } from './ExplorerFileRowAdapter';

type State = {
  loading: boolean;
  error: string | null;
  items: ExplorerItem[];
};

export function useExplorerData(
  wallet: string,
  path: string[]
) {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    items: [],
  });

  useEffect(() => {
    if (!wallet) return;

    let cancelled = false;

    async function load() {
      setState((s) => ({
        ...s,
        loading: true,
        error: null,
      }));

      try {
        const res = await fetch(
          `/api/files?wallet=${wallet}&path=${encodeURIComponent(
            path.join('/')
          )}`
        );

        if (!res.ok) {
          throw new Error('Failed to load explorer data');
        }

        const data: {
          folders: FolderItem[];
          files: FileItemData[];
        } = await res.json();

        if (cancelled) return;

        const items: ExplorerItem[] = [
          ...data.folders.map(
            (f): ExplorerItem => ({
              ...f,
              type: 'folder' as const,
            })
          ),
          ...data.files.map(
            (f): ExplorerItem => ({
              ...f,
              type: 'file' as const,
            })
          ),
        ];

        setState({
          loading: false,
          error: null,
          items,
        });
      } catch (e: any) {
        if (cancelled) return;

        setState({
          loading: false,
          error: e.message ?? 'Unknown error',
          items: [],
        });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [wallet, path.join('/')]);

  return state;
}
