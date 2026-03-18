"use client"
import React, { useState } from "react"
import { Plus } from "lucide-react"
import { AddBookmarkModal } from "@/components/add-bookmark-modal"
import { Bookmark } from "@/lib/types"

interface FABProps {
  onSuccess?: (bookmark: Bookmark) => void
}

export function FAB({ onSuccess }: FABProps) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 30,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 20px', height: 44,
          borderRadius: 999,
          background: hovered ? 'rgba(240,240,240,0.95)' : '#ffffff',
          color: '#000000',
          border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          transition: 'all 0.15s ease',
          transform: hovered ? 'scale(1.02)' : 'scale(1)',
        }}
        aria-label="Add bookmark"
      >
        <Plus style={{ width: 16, height: 16 }} strokeWidth={2.5} />
        Add bookmark
      </button>
      <AddBookmarkModal open={open} onOpenChange={setOpen} onSuccess={onSuccess} />
    </>
  )
}
