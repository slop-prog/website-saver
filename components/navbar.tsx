"use client"
import React, { useState } from "react"
import Link from "next/link"
import { Bookmark, LogOut, User, ChevronDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NavbarProps {
  userEmail?: string | null
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(10,10,10,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.6)' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.01em' }}>
            Visual Bookmark
          </span>
        </Link>

        <div>
          {userEmail ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              >
                <User style={{ width: 13, height: 13 }} />
                <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</span>
                <ChevronDown style={{ width: 12, height: 12 }} />
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 6, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 50 }}>
                  <button
                    onClick={signOut}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: 13, textAlign: 'left' }}
                  >
                    <LogOut style={{ width: 13, height: 13 }} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none' }}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
