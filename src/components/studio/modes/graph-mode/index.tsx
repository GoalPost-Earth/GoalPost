'use client'

import { useCallback, useEffect, useState, type FC } from 'react'
import { cn } from '@/lib/utils'
import { useFocalEntity } from '@/contexts'
import { SpatialView } from './spatial-view'
import { BloomView } from './bloom-view'

type GraphView = 'spatial' | 'bloom'

const STORAGE_KEY = 'goalpost.studio.graphView.v1'

const VIEW_META: { id: GraphView; label: string; icon: string }[] = [
  { id: 'spatial', label: 'Spatial', icon: 'bubble_chart' },
  { id: 'bloom', label: 'Bloom', icon: 'hub' },
]

interface GraphModeProps {
  visible: boolean
}

function readStored(): GraphView {
  if (typeof window === 'undefined') return 'spatial'
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (v === 'spatial' || v === 'bloom') return v
  } catch {
    // ignore
  }
  return 'spatial'
}

/**
 * Orchestrator for the Graph mode. Hosts a sub-toggle between two views:
 *
 * - **Spatial**: GoalPost-styled rendering (entity colors, glass chips,
 *   highlights the focal entity).
 * - **Bloom**: stock `@neo4j-nvl/react` exploration with pan/zoom and a
 *   click-to-inspect side panel.
 *
 * Press `G` while the Graph mode is visible to cycle the sub-view.
 */
export const GraphMode: FC<GraphModeProps> = ({ visible }) => {
  const { focalEntity } = useFocalEntity()
  const [view, setView] = useState<GraphView>(() => readStored())

  const setAndPersist = useCallback((next: GraphView) => {
    setView(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable
        ) {
          return
        }
      }
      if (e.key.toLowerCase() === 'g') {
        e.preventDefault()
        setAndPersist(view === 'spatial' ? 'bloom' : 'spatial')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, view, setAndPersist])

  return (
    <div
      className={cn(
        'absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950',
        !visible && 'pointer-events-none'
      )}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
      aria-hidden={!visible}
    >
      <div className="relative h-full">
        {view === 'spatial' ? <SpatialView /> : <BloomView />}

        {/* Sub-toggle floats at top-right (under chrome) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {focalEntity && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl px-3 py-1.5 text-xs text-white/80">
              <span className="material-symbols-outlined text-[14px] leading-none text-white/55">
                center_focus_strong
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                {focalEntity.type}
              </span>
              <span className="font-semibold text-white max-w-[18ch] truncate">
                {focalEntity.label || focalEntity.id.slice(0, 8)}
              </span>
            </div>
          )}
          <div
            role="tablist"
            aria-label="Graph view"
            className="flex items-center gap-1 rounded-full border border-white/15 bg-slate-900/60 p-1 backdrop-blur-xl shadow-lg"
          >
            {VIEW_META.map((v) => {
              const active = view === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setAndPersist(v.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer',
                    active
                      ? 'bg-gradient-to-r from-emerald-400/80 to-teal-400/80 text-white shadow-inner'
                      : 'text-white/55 hover:text-white/85 hover:bg-white/5'
                  )}
                  aria-label={`${v.label} view (press G to toggle)`}
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">
                    {v.icon}
                  </span>
                  <span className="hidden md:inline">{v.label}</span>
                </button>
              )
            })}
            <kbd className="hidden lg:inline-flex h-4 min-w-4 ml-1 items-center justify-center rounded-sm border border-white/10 bg-white/5 px-1 font-mono text-[10px] leading-none text-white/40">
              G
            </kbd>
          </div>
        </div>
      </div>
    </div>
  )
}
