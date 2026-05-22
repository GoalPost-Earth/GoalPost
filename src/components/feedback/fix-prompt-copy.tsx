'use client'

import { useState, type FC } from 'react'
import { Clipboard, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FixPromptCopyProps {
  prompt: string
}

/**
 * Render the generated fix prompt with a one-click copy button. The
 * dev pastes the result into a fresh Claude Code session to drive the
 * fix → test → commit loop. Pure client UI; the prompt itself is
 * generated server-side by `buildFixPrompt`.
 */
export const FixPromptCopy: FC<FixPromptCopyProps> = ({ prompt }) => {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      // Reset the "copied" affordance after a short flash so a second
      // copy attempt still gives the user feedback.
      setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      console.warn(
        '[FixPromptCopy] clipboard write failed:',
        error instanceof Error ? error.message : error
      )
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleCopy}
          className={
            'h-7 text-xs ' +
            (copied
              ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
              : 'bg-gp-primary hover:bg-gp-primary/90 text-white')
          }
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1" /> Copied — paste into Claude Code
            </>
          ) : (
            <>
              <Clipboard className="w-3.5 h-3.5 mr-1" /> Copy fix prompt
            </>
          )}
        </Button>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] text-gp-ink-soft dark:text-white/40 hover:underline"
        >
          {expanded ? 'Hide preview' : 'Show preview'}
        </button>
        <span className="text-[11px] text-gp-ink-soft dark:text-white/40">
          {prompt.length.toLocaleString()} chars
        </span>
      </div>
      {expanded && (
        <pre className="whitespace-pre-wrap break-words text-[11px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-3 py-2 max-h-[400px] overflow-auto font-mono">
          {prompt}
        </pre>
      )}
    </div>
  )
}
