'use client'

import {
  type CodeHeaderProps,
  MarkdownTextPrimitive,
  unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
} from '@assistant-ui/react-markdown'
import remarkGfm from 'remark-gfm'
import { type FC, memo, useState } from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { TooltipIconButton } from './tooltip-icon-button'
import { cn } from '@/lib/utils'

const MarkdownTextImpl = () => {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-md"
      components={defaultComponents}
    />
  )
}

export const MarkdownText = memo(MarkdownTextImpl)

const CodeHeader: FC<CodeHeaderProps> = ({ language, code }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard()
  const onCopy = () => {
    if (!code || isCopied) return
    copyToClipboard(code)
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-t-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
      <span className="lowercase [&>span]:text-xs">{language}</span>
      <TooltipIconButton tooltip="Copy" onClick={onCopy}>
        {!isCopied && <CopyIcon />}
        {isCopied && <CheckIcon />}
      </TooltipIconButton>
    </div>
  )
}

const useCopyToClipboard = ({
  copiedDuration = 3000,
}: {
  copiedDuration?: number
} = {}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const copyToClipboard = (value: string) => {
    if (!value) return

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), copiedDuration)
    })
  }

  return { isCopied, copyToClipboard }
}

// Chat-tuned markdown components. Sizes are deliberately restrained for a
// message bubble (not document-scale): headings step down gently, paragraphs
// and lists carry generous vertical rhythm, and every element references theme
// tokens (`text-foreground`, `text-muted-foreground`, `border-border`,
// `bg-muted`, `gp-primary`) so the rendering reads correctly in light, dark,
// and every theme variant. Exported so the live `EnhancedTextPart` renderer
// shares the exact same styling.
export const defaultComponents = memoizeMarkdownComponents({
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        'mt-4 mb-2 scroll-m-20 text-lg font-semibold tracking-tight first:mt-0 last:mb-0',
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        'mt-4 mb-2 scroll-m-20 text-base font-semibold tracking-tight first:mt-0 last:mb-0',
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        'mt-4 mb-1.5 scroll-m-20 text-sm font-semibold tracking-tight first:mt-0 last:mb-0',
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        'mt-4 mb-1.5 scroll-m-20 text-sm font-semibold tracking-tight first:mt-0 last:mb-0',
        className
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn(
        'my-2 text-sm font-semibold first:mt-0 last:mb-0',
        className
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      className={cn(
        'my-2 text-sm font-semibold text-muted-foreground first:mt-0 last:mb-0',
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn('my-2.5 leading-6 first:mt-0 last:mb-0', className)}
      {...props}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        'text-gp-primary font-medium underline underline-offset-4 hover:opacity-80',
        className
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong
      className={cn('font-semibold text-foreground', className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        'my-2.5 border-l-2 border-gp-primary/40 pl-4 text-muted-foreground italic [&>p]:my-1',
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        'my-2.5 ml-5 list-disc marker:text-muted-foreground [&>li]:mt-1 [&>li]:leading-6',
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        'my-2.5 ml-5 list-decimal marker:text-muted-foreground [&>li]:mt-1 [&>li]:leading-6',
        className
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn('my-4 border-border', className)} {...props} />
  ),
  table: ({ className, ...props }) => (
    <table
      className={cn(
        'my-5 w-full border-separate border-spacing-0 overflow-y-auto',
        className
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        'bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        'border-b border-l border-border px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn(
        'm-0 border-b border-border p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg',
        className
      )}
      {...props}
    />
  ),
  sup: ({ className, ...props }) => (
    <sup
      className={cn('[&>a]:text-xs [&>a]:no-underline', className)}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        'overflow-x-auto !rounded-t-none rounded-b-lg bg-black p-4 text-white',
        className
      )}
      {...props}
    />
  ),
  code: function Code({ className, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock()
    return (
      <code
        className={cn(
          !isCodeBlock && 'bg-muted rounded border font-semibold',
          className
        )}
        {...props}
      />
    )
  },
  CodeHeader,
})
