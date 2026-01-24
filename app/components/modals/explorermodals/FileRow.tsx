'use client'

import React from 'react'

export interface ExplorerItem {
  id: string
  name: string
  type: 'file' | 'folder'
  fileType?: string
  size?: string
}

interface FileRowProps {
  item: ExplorerItem
  onOpen: (item: ExplorerItem) => void
}

export default function FileRow({ item, onOpen }: FileRowProps) {
  const isFolder = item.type === 'folder'

  return (
    <div
      onClick={() => onOpen(item)}
      className="
        group
        grid grid-cols-[1fr_140px_120px_120px]
        px-4 py-2
        text-sm
        cursor-pointer
        transition-colors
        hover:bg-muted/60
      "
    >
      {/* Name */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-muted-foreground">
          {isFolder ? '📁' : '📄'}
        </span>

        <span className="truncate font-medium">
          {item.name}
        </span>
      </div>

      {/* Type */}
      <div className="text-muted-foreground text-xs">
        {isFolder ? 'Folder' : item.fileType ?? 'File'}
      </div>

      {/* Size */}
      <div className="text-muted-foreground text-xs">
        {isFolder ? '—' : item.size ?? '—'}
      </div>

      {/* Actions */}
      <div
        className="
          flex items-center justify-end gap-2
          opacity-0
          group-hover:opacity-100
          transition-opacity
        "
        onClick={(e) => e.stopPropagation()}
      >
        <button className="hover:underline text-xs">
          Preview
        </button>
        <button className="hover:underline text-xs">
          Download
        </button>
      </div>
    </div>
  )
}
