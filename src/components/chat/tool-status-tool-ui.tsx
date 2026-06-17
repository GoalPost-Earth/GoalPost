'use client'

import type { ToolCallMessagePartComponent } from '@assistant-ui/react'

/**
 * Live status chips for the assistant's READ tools (Phase 2b).
 *
 * Read-tool calls used to render nothing, so a multi-step lookup left the user
 * staring at a generic "Thinking…" spinner with no idea what the assistant was
 * actually doing. This renders a compact, themed one-line chip per read tool:
 * an animated "Searching pulses…" while it runs, a muted "Searched pulses" once
 * it completes, and a quiet failure line otherwise. The model's narration
 * (Phase 2a) says it in prose; this is the visual receipt that something is
 * happening between the narration and the answer.
 *
 * Rule 1 (kb/07): chips show only friendly, hand-written labels keyed off the
 * tool NAME — never result content, entity names from results, or raw ids.
 *
 * Write tools are NOT handled here (they route to WriteApprovalToolPart via the
 * `Fallback`), and `suggest_pulses` keeps its own dedicated renderer.
 */

interface ToolStatusCopy {
  /** Present-continuous, shown while the tool runs. */
  running: string
  /** Past-tense, shown once the tool completes. */
  done: string
  /** Material Symbols glyph hinting at the tool's domain. */
  icon: string
}

const TOOL_STATUS_COPY: Record<string, ToolStatusCopy> = {
  get_my_spaces: {
    running: 'Finding your spaces',
    done: 'Found your spaces',
    icon: 'workspaces',
  },
  search_person: {
    running: 'Looking up people',
    done: 'Looked up people',
    icon: 'person_search',
  },
  search_community: {
    running: 'Searching communities',
    done: 'Searched communities',
    icon: 'groups',
  },
  search_space: {
    running: 'Searching spaces',
    done: 'Searched spaces',
    icon: 'workspaces',
  },
  search_field_context: {
    running: 'Searching field contexts',
    done: 'Searched field contexts',
    icon: 'category',
  },
  list_field_contexts_in_active_space: {
    running: 'Listing field contexts',
    done: 'Listed field contexts',
    icon: 'category',
  },
  search_pulse: {
    running: 'Searching pulses',
    done: 'Searched pulses',
    icon: 'search',
  },
  graph_rag_search: {
    running: 'Searching across the graph',
    done: 'Searched the graph',
    icon: 'hub',
  },
  query_for_bloom: {
    running: 'Pulling up the graph',
    done: 'Updated the canvas',
    icon: 'account_tree',
  },
  get_focal_entity: {
    running: 'Checking your current view',
    done: 'Checked your current view',
    icon: 'center_focus_strong',
  },
}

const FALLBACK_COPY: ToolStatusCopy = {
  running: 'Working',
  done: 'Done',
  icon: 'bolt',
}

export const ToolStatusPart: ToolCallMessagePartComponent = ({
  toolName,
  status,
}) => {
  const copy = TOOL_STATUS_COPY[toolName] ?? FALLBACK_COPY

  // requires-action shouldn't arise for read tools, but if it does, treat it
  // as still-running rather than dropping the chip.
  const isRunning =
    status.type === 'running' || status.type === 'requires-action'
  const isError = status.type === 'incomplete'

  if (isError) {
    return (
      <div
        className="mt-1 flex items-center gap-1.5 text-xs text-gp-ink-soft dark:text-white/40"
        role="status"
      >
        <span className="material-symbols-outlined text-[14px] leading-none">
          error
        </span>
        <span className="truncate">Couldn’t finish that lookup</span>
      </div>
    )
  }

  if (isRunning) {
    return (
      <div
        className="mt-1 flex items-center gap-1.5 text-xs text-gp-ink-muted dark:text-white/55"
        role="status"
        aria-live="polite"
        aria-label={`${copy.running}…`}
      >
        <span className="material-symbols-outlined text-[14px] leading-none text-gp-primary motion-safe:animate-spin">
          progress_activity
        </span>
        <span className="truncate">{copy.running}…</span>
      </div>
    )
  }

  // status.type === 'complete'
  return (
    <div
      className="mt-1 flex items-center gap-1.5 text-xs text-gp-ink-soft dark:text-white/45"
      role="status"
    >
      <span className="material-symbols-outlined text-[14px] leading-none text-gp-resource/80">
        check_circle
      </span>
      <span className="truncate">{copy.done}</span>
    </div>
  )
}

/**
 * Tool-name → ToolStatusPart map, ready to spread into thread.tsx's
 * `tools.by_name`. Computed once at module scope. A tool not listed here
 * simply falls through to the Fallback (renders nothing), so adding a new read
 * tool degrades gracefully until it gets an entry.
 */
export const READ_TOOL_STATUS_COMPONENTS: Record<
  string,
  ToolCallMessagePartComponent
> = Object.fromEntries(
  Object.keys(TOOL_STATUS_COPY).map((name) => [name, ToolStatusPart])
)
