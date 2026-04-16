import { ReactNode } from 'react'

type LinkifiedTextProps = {
  text?: string | null
  className?: string
}

export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  if (!text) return null

  const linkRegex =
    /(?<!@)\b(?:https?:\/\/|ftp:\/\/|www\.|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})[^\s<>")\]]*/gi
  const nodes: ReactNode[] = []
  let lastIndex = 0

  for (const match of text.matchAll(linkRegex)) {
    const raw = match[0]
    const matchIndex = match.index ?? 0

    if (matchIndex > lastIndex) {
      nodes.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, matchIndex)}
        </span>
      )
    }

    const trailingPunctuation = raw.match(/[.,!?;:]+$/)?.[0] ?? ''
    const cleanUrl = trailingPunctuation
      ? raw.slice(0, raw.length - trailingPunctuation.length)
      : raw

    if (cleanUrl) {
      const href = /^(https?|ftp):\/\//i.test(cleanUrl)
        ? cleanUrl
        : `https://${cleanUrl}`

      nodes.push(
        <a
          key={`link-${matchIndex}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gp-primary hover:underline break-all"
        >
          {cleanUrl}
        </a>
      )
    }

    if (trailingPunctuation) {
      nodes.push(<span key={`punct-${matchIndex}`}>{trailingPunctuation}</span>)
    }

    lastIndex = matchIndex + raw.length
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return <p className={className}>{nodes.length > 0 ? nodes : text}</p>
}
