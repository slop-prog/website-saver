"use client"
import React from "react"
import { Search, X } from "lucide-react"

interface SearchInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = "Search bookmarks…" }: SearchInputProps) {
  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
      <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', height: 36, paddingLeft: 32, paddingRight: 32,
          borderRadius: 8, fontSize: 13,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.8)',
          outline: 'none', transition: 'border 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
      {value && (
        <button onClick={() => onChange("")} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 2 }}>
          <X style={{ width: 14, height: 14 }} />
        </button>
      )}
    </div>
  )
}
