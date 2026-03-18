"use client"
import React, { useState } from "react"
import { ExternalLink, MoreHorizontal, Bookmark, Trash2, Globe } from "lucide-react"
import { getDomain, getMicrolinkScreenshot } from "@/lib/utils"
import { Bookmark as BookmarkType, Group } from "@/lib/types"

interface BookmarkCardProps {
  bookmark: BookmarkType
  groups?: Group[]
  bookmarkGroupIds?: string[]
  onDelete?: (id: string) => void
  onAddToGroup?: (bookmarkId: string, groupId: string) => void
  onRemoveFromGroup?: (bookmarkId: string, groupId: string) => void
  style?: React.CSSProperties
}

export function BookmarkCard({ bookmark, groups = [], bookmarkGroupIds = [], onDelete, onAddToGroup, onRemoveFromGroup, style }: BookmarkCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const domain = getDomain(bookmark.url)
  const screenshotUrl = bookmark.image || getMicrolinkScreenshot(bookmark.url)

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-nav]')) return
    window.open(bookmark.url, "_blank", "noopener,noreferrer")
  }

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      style={{
        ...style,
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        border: hovered ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.07)',
        background: '#111111',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.6)' : '0 2px 8px rgba(0,0,0,0.3)',
        position: 'relative',
      }}
    >
      {/* Browser chrome */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0e0e0e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '2px 8px', minWidth: 0 }}>
            <Globe style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{domain}</span>
          </div>
        </div>

        <div data-no-nav style={{ display: 'flex', gap: 2, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
          <a href={bookmark.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            style={{ padding: 4, borderRadius: 6, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
            <ExternalLink style={{ width: 12, height: 12 }} />
          </a>
          <div style={{ position: 'relative' }}>
            <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
              style={{ padding: 4, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
              <MoreHorizontal style={{ width: 14, height: 14 }} />
            </button>
            {menuOpen && (
              <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '110%', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 6, minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 50 }}>
                {groups.length > 0 && (
                  <>
                    <div style={{ padding: '4px 10px 6px', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Save to group</div>
                    {groups.map(group => {
                      const inGroup = bookmarkGroupIds.includes(group.id)
                      return (
                        <button key={group.id}
                          onClick={() => { inGroup ? onRemoveFromGroup?.(bookmark.id, group.id) : onAddToGroup?.(bookmark.id, group.id); setMenuOpen(false) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: inGroup ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'left' }}>
                          <Bookmark style={{ width: 13, height: 13, fill: inGroup ? 'currentColor' : 'none' }} />
                          {group.name}
                          {inGroup && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>✓</span>}
                        </button>
                      )
                    })}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                  </>
                )}
                <button onClick={() => { onDelete?.(bookmark.id); setMenuOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: 13, textAlign: 'left' }}>
                  <Trash2 style={{ width: 13, height: 13 }} />
                  Delete bookmark
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screenshot */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', background: '#0d0d0d', overflow: 'hidden' }}>
        {!imgLoaded && !imgError && (
          <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />
        )}
        {!imgError ? (
          <img
            src={screenshotUrl}
            alt={bookmark.title || domain}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true) }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Globe style={{ width: 32, height: 32, color: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{domain}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {bookmark.title || domain}
        </p>
        {bookmark.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
            {bookmark.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
