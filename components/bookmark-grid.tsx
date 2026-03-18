"use client"
import React, { useEffect, useRef, useCallback } from "react"
import { BookmarkCard } from "@/components/bookmark-card"
import { Bookmark, Group } from "@/lib/types"
import { Globe } from "lucide-react"

interface BookmarkGridProps {
  bookmarks: Bookmark[]
  groups?: Group[]
  bookmarkGroupMap?: Record<string, string[]>
  onDelete?: (id: string) => void
  onAddToGroup?: (bookmarkId: string, groupId: string) => void
  onRemoveFromGroup?: (bookmarkId: string, groupId: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
  emptyState?: React.ReactNode
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: '#111' }}>
      <div style={{ height: 40, background: '#0e0e0e', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0,1,2].map(i => <div key={i} className="shimmer" style={{ width: 10, height: 10, borderRadius: '50%' }} />)}
        </div>
        <div className="shimmer" style={{ height: 16, width: 100, borderRadius: 6 }} />
      </div>
      <div className="shimmer" style={{ aspectRatio: '16/10' }} />
      <div style={{ padding: 12 }}>
        <div className="shimmer" style={{ height: 12, width: '75%', borderRadius: 4 }} />
      </div>
    </div>
  )
}

export function BookmarkGrid({ bookmarks, groups = [], bookmarkGroupMap = {}, onDelete, onAddToGroup, onRemoveFromGroup, onLoadMore, hasMore = false, loading = false, emptyState }: BookmarkGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && hasMore && !loading) onLoadMore?.()
  }, [hasMore, loading, onLoadMore])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1, rootMargin: "200px" })
    const el = sentinelRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [handleObserver])

  if (!loading && bookmarks.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 120 }}>{emptyState}</div>
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {bookmarks.map((bookmark, i) => (
          <div key={bookmark.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i % 20, 10) * 30}ms`, animationFillMode: 'both' }}>
            <BookmarkCard
              bookmark={bookmark}
              groups={groups}
              bookmarkGroupIds={bookmarkGroupMap[bookmark.id] || []}
              onDelete={onDelete}
              onAddToGroup={onAddToGroup}
              onRemoveFromGroup={onRemoveFromGroup}
            />
          </div>
        ))}
        {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
      </div>
      <div ref={sentinelRef} style={{ height: 16, marginTop: 16 }} />
    </div>
  )
}
