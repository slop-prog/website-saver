"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Compass, Library, Tag, FolderPlus, Loader2, X, Globe, Bookmark, Plus } from "lucide-react"
import { BookmarkGrid } from "@/components/bookmark-grid"
import { SearchInput } from "@/components/search-input"
import { FAB } from "@/components/fab"
import { Navbar } from "@/components/navbar"
import { AddBookmarkModal } from "@/components/add-bookmark-modal"
import { createClient } from "@/lib/supabase/client"
import { Bookmark as BookmarkType, Group } from "@/lib/types"
import { toast } from "@/components/ui/toast"

const PAGE_SIZE = 20

export default function HomePage() {
  const supabase = createClient()

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'explore' | 'library'>('explore')

  // Explore
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [exploreOffset, setExploreOffset] = useState(0)
  const [exploreHasMore, setExploreHasMore] = useState(false)
  const [exploreLoading, setExploreLoading] = useState(false)

  // Library
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [libraryBookmarks, setLibraryBookmarks] = useState<BookmarkType[]>([])
  const [libraryOffset, setLibraryOffset] = useState(0)
  const [libraryHasMore, setLibraryHasMore] = useState(false)
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [bookmarkGroupMap, setBookmarkGroupMap] = useState<Record<string, string[]>>({})

  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [creatingGroup, setCreatingGroup] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
      setUserId(data.user?.id ?? null)
    })
  }, [])

  // Explore load
  const doLoadExplore = useCallback(async (uid: string, q: string, tag: string | null, offset: number) => {
    let query = supabase.from("bookmarks").select("*").eq("user_id", uid).order("created_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1)
    if (q) query = query.or(`title.ilike.%${q}%,url.ilike.%${q}%`)
    if (tag) query = query.contains("tags", [tag])
    return query
  }, [])

  useEffect(() => {
    if (!userId) return
    setExploreLoading(true)
    const timer = setTimeout(async () => {
      const { data } = await doLoadExplore(userId, search, activeTag, 0)
      if (data) { setBookmarks(data); setExploreOffset(data.length); setExploreHasMore(data.length === PAGE_SIZE) }
      setExploreLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [userId, search, activeTag])

  const loadMoreExplore = useCallback(async () => {
    if (!userId || exploreLoading) return
    setExploreLoading(true)
    const { data } = await doLoadExplore(userId, search, activeTag, exploreOffset)
    if (data) { setBookmarks(prev => [...prev, ...data]); setExploreOffset(prev => prev + data.length); setExploreHasMore(data.length === PAGE_SIZE) }
    setExploreLoading(false)
  }, [userId, search, activeTag, exploreOffset, exploreLoading])

  useEffect(() => {
    if (!userId) return
    supabase.from("bookmarks").select("tags").eq("user_id", userId).then(({ data }) => {
      if (data) {
        const s = new Set<string>()
        data.forEach(b => (b.tags || []).forEach((t: string) => s.add(t)))
        setAllTags(Array.from(s).sort())
      }
    })
  }, [userId, bookmarks.length])

  // Library load
  useEffect(() => {
    if (!userId) return
    supabase.from("groups").select("*").eq("user_id", userId).order("created_at").then(({ data }) => { if (data) setGroups(data) })
  }, [userId])

  const doLoadLibrary = useCallback(async (uid: string, groupId: string | null, offset: number) => {
    if (groupId) {
      const { data: bg } = await supabase.from("bookmark_groups").select("bookmark_id").eq("group_id", groupId)
      const ids = (bg || []).map((r: any) => r.bookmark_id)
      if (!ids.length) return { data: [] }
      const { data } = await supabase.from("bookmarks").select("*").in("id", ids).order("created_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1)
      return { data: data || [] }
    } else {
      const { data } = await supabase.from("bookmarks").select("*").eq("user_id", uid).order("created_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1)
      return { data: data || [] }
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    setLibraryLoading(true)
    const timer = setTimeout(async () => {
      const { data } = await doLoadLibrary(userId, selectedGroup, 0)
      setLibraryBookmarks(data || []); setLibraryOffset((data || []).length); setLibraryHasMore((data || []).length === PAGE_SIZE)
      setLibraryLoading(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [userId, selectedGroup])

  const loadMoreLibrary = useCallback(async () => {
    if (!userId || libraryLoading) return
    setLibraryLoading(true)
    const { data } = await doLoadLibrary(userId, selectedGroup, libraryOffset)
    if (data) { setLibraryBookmarks(prev => [...prev, ...data]); setLibraryOffset(prev => prev + data.length); setLibraryHasMore(data.length === PAGE_SIZE) }
    setLibraryLoading(false)
  }, [userId, selectedGroup, libraryOffset, libraryLoading])

  useEffect(() => {
    const allIds = [...new Set([...bookmarks, ...libraryBookmarks].map(b => b.id))]
    if (!allIds.length) return
    supabase.from("bookmark_groups").select("*").in("bookmark_id", allIds).then(({ data }) => {
      if (data) {
        const map: Record<string, string[]> = {}
        data.forEach((bg: any) => { if (!map[bg.bookmark_id]) map[bg.bookmark_id] = []; map[bg.bookmark_id].push(bg.group_id) })
        setBookmarkGroupMap(map)
      }
    })
  }, [bookmarks.length, libraryBookmarks.length])

  const handleDelete = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
    setBookmarks(b => b.filter(x => x.id !== id))
    setLibraryBookmarks(b => b.filter(x => x.id !== id))
    toast({ title: "Bookmark deleted" })
  }

  const handleAddToGroup = async (bookmarkId: string, groupId: string) => {
    await supabase.from("bookmark_groups").insert({ bookmark_id: bookmarkId, group_id: groupId })
    setBookmarkGroupMap(prev => ({ ...prev, [bookmarkId]: [...(prev[bookmarkId] || []), groupId] }))
    toast({ title: "Added to group" })
  }

  const handleRemoveFromGroup = async (bookmarkId: string, groupId: string) => {
    await supabase.from("bookmark_groups").delete().eq("bookmark_id", bookmarkId).eq("group_id", groupId)
    setBookmarkGroupMap(prev => ({ ...prev, [bookmarkId]: (prev[bookmarkId] || []).filter(id => id !== groupId) }))
    if (selectedGroup === groupId) setLibraryBookmarks(b => b.filter(x => x.id !== bookmarkId))
    toast({ title: "Removed from group" })
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim() || !userId) return
    setCreatingGroup(true)
    const { data, error } = await supabase.from("groups").insert({ name: newGroupName.trim(), user_id: userId }).select().single()
    if (!error && data) { setGroups(g => [...g, data]); toast({ title: "Group created" }) }
    setNewGroupName(""); setCreatingGroup(false); setCreateGroupOpen(false)
  }

  const S = {
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, background: '#0a0a0a' },
    main: { flex: 1, maxWidth: 1280, margin: '0 auto', width: '100%', padding: '32px 24px' },
    tabBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' as const },
    tabList: { display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' },
    toolbar: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' as const },
  }

  const tabBtn = (tab: 'explore' | 'library') => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
    background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: activeTab === tab ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
    transition: 'all 0.15s',
  })

  const groupPill = (id: string | null) => ({
    flexShrink: 0, padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' as const,
    background: selectedGroup === id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
    color: selectedGroup === id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.38)',
    border: selectedGroup === id ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.06)',
    transition: 'all 0.15s',
  })

  return (
    <div style={S.page}>
      <Navbar userEmail={userEmail} />
      <main style={S.main}>
        {/* Tab bar */}
        <div style={S.tabBar}>
          <div style={S.tabList}>
            <button style={tabBtn('explore')} onClick={() => setActiveTab('explore')}>
              <Compass style={{ width: 14, height: 14 }} /> Explore
            </button>
            <button style={tabBtn('library')} onClick={() => setActiveTab('library')}>
              <Library style={{ width: 14, height: 14 }} /> Your Library
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            <span>Bookmarklet:</span>
            <a
              href={`javascript:(function(){window.open('https://website-saver.vercel.app/add?url='+encodeURIComponent(location.href),'_blank','width=480,height=400')})()`}
              
              draggable
              style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 6, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', cursor: 'grab' }}
            >
              📎 Save to Library
            </a>
          </div>
        </div>

        {/* EXPLORE */}
        {activeTab === 'explore' && (
          <div>
            <div style={S.toolbar}>
              <SearchInput value={search} onChange={setSearch} />
              {allTags.slice(0, 10).map(tag => (
                <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: activeTag === tag ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.07)', background: activeTag === tag ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', color: activeTag === tag ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.38)', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <Tag style={{ width: 10, height: 10 }} />{tag}
                  {activeTag === tag && <X style={{ width: 10, height: 10 }} />}
                </button>
              ))}
            </div>
            <BookmarkGrid bookmarks={bookmarks} groups={groups} bookmarkGroupMap={bookmarkGroupMap} onDelete={handleDelete} onAddToGroup={handleAddToGroup} onRemoveFromGroup={handleRemoveFromGroup} onLoadMore={loadMoreExplore} hasMore={exploreHasMore} loading={exploreLoading && bookmarks.length === 0}
              emptyState={<EmptyState icon={<Globe style={{ width: 24, height: 24, color: 'rgba(255,255,255,0.12)' }} />} title={search || activeTag ? "No bookmarks found" : "No bookmarks yet"} desc={search || activeTag ? "Try a different search" : "Click the button below to save your first URL"} />}
            />
          </div>
        )}

        {/* LIBRARY */}
        {activeTab === 'library' && (
          userId ? (
            <div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Groups</span>
                  <button onClick={() => setCreateGroupOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 7, background: 'none', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                    <FolderPlus style={{ width: 13, height: 13 }} /> New group
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {[{ id: null as string | null, name: 'All bookmarks' }, ...groups].map(g => (
                    <button key={g.id ?? 'all'} onClick={() => setSelectedGroup(g.id)} style={groupPill(g.id)}>{g.name}</button>
                  ))}
                </div>
              </div>
              <BookmarkGrid bookmarks={libraryBookmarks} groups={groups} bookmarkGroupMap={bookmarkGroupMap} onDelete={handleDelete} onAddToGroup={handleAddToGroup} onRemoveFromGroup={handleRemoveFromGroup} onLoadMore={loadMoreLibrary} hasMore={libraryHasMore} loading={libraryLoading && libraryBookmarks.length === 0}
                emptyState={<EmptyState icon={<Bookmark style={{ width: 24, height: 24, color: 'rgba(255,255,255,0.12)' }} />} title={selectedGroup ? "No bookmarks in this group" : "Library is empty"} desc={selectedGroup ? "Add bookmarks via the card menu" : "Start saving URLs from the Explore tab"} />}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 120 }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Sign in to view your library</p>
              <a href="/login" style={{ padding: '8px 20px', borderRadius: 8, background: '#fff', color: '#000', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
            </div>
          )
        )}
      </main>

      {userId && <FAB onSuccess={b => setBookmarks(prev => [b, ...prev])} />}

      {/* Create group modal */}
      {createGroupOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setCreateGroupOpen(false)}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 380, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderPlus style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.4)' }} /> Create group
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>Organise your bookmarks into collections</p>
            <form onSubmit={handleCreateGroup}>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Name</label>
              <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Design, Dev tools, Reading…" autoFocus required
                style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', marginBottom: 16 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setCreateGroupOpen(false)} style={{ flex: 1, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={creatingGroup || !newGroupName.trim()} style={{ flex: 1, height: 36, borderRadius: 8, background: '#fff', border: 'none', color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: !newGroupName.trim() ? 0.5 : 1 }}>
                  {creatingGroup ? '...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        {icon}
      </div>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>{desc}</p>
    </div>
  )
}
