'use client'

import { useMessage } from '@assistant-ui/react'
import { MarkdownText } from './markdown-text'
import { PersonCard, PersonProfileData } from './person-card'
import { useMemo } from 'react'

/**
 * Enhanced message renderer that detects person profile data
 * and renders PersonCard components inline
 */
export function EnhancedMessageText() {
  const message = useMessage()

  // Access content from the message state
  const content = message.content

  // Find text content parts - filter for text type and extract text
  const textParts = content.filter(
    (part): part is Extract<typeof part, { type: 'text' }> =>
      part.type === 'text'
  )
  const textContent = textParts.map((part) => part.text).join('\n')

  // Parse content for person profile data
  const parsedContent = useMemo(() => {
    const elements: Array<{
      type: 'text' | 'person'
      content: string | PersonProfileData
    }> = []

    // Look for PERSON_PROFILE_FOUND marker with JSON data
    const personMarkerRegex =
      /PERSON_PROFILE_FOUND:\s*(\{[\s\S]*?\}(?=\s*(?:PERSON_PROFILE_FOUND:|$)))/g
    let lastIndex = 0
    let match

    while ((match = personMarkerRegex.exec(textContent)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = textContent.substring(lastIndex, match.index).trim()
        if (beforeText) {
          elements.push({ type: 'text', content: beforeText })
        }
      }

      // Parse and add person data
      try {
        const personData = JSON.parse(match[1]) as PersonProfileData
        elements.push({ type: 'person', content: personData })
      } catch (error) {
        console.error('Failed to parse person data:', error)
        // If parsing fails, treat as text
        elements.push({ type: 'text', content: match[0] })
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text after last match
    if (lastIndex < textContent.length) {
      const remainingText = textContent.substring(lastIndex).trim()
      if (remainingText) {
        elements.push({ type: 'text', content: remainingText })
      }
    }

    // If no person markers found, add the whole text
    if (elements.length === 0 && textContent) {
      elements.push({ type: 'text', content: textContent })
    }

    return elements
  }, [textContent])

  // Check if we have any person profiles to render
  const hasPersonProfile = parsedContent.some((el) => el.type === 'person')

  if (!hasPersonProfile) {
    // Use default MarkdownText renderer
    return <MarkdownText />
  }

  // Render mixed content with person cards
  return (
    <div className="space-y-4">
      {parsedContent.map((element, index) => {
        if (element.type === 'person') {
          return (
            <PersonCard
              key={`person-${index}`}
              person={element.content as PersonProfileData}
              className="my-4"
            />
          )
        } else {
          // Render text as simple div with the content
          // We can't use MarkdownText directly with custom text
          return (
            <div
              key={`text-${index}`}
              className="prose prose-sm dark:prose-invert max-w-none"
            >
              {element.content as string}
            </div>
          )
        }
      })}
    </div>
  )
}
