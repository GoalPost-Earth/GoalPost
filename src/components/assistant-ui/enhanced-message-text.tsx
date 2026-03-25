'use client'

import { useMessagePartText } from '@assistant-ui/react'
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown'
import { PersonCard, PersonProfileData } from './person-card'
import { memo, useMemo } from 'react'
import remarkGfm from 'remark-gfm'

/**
 * Custom text message part component that detects PERSON_PROFILE_FOUND markers
 * and renders PersonCard components instead of raw JSON.
 *
 * Must be used as the Text component in MessagePrimitive.Parts.
 */
export const EnhancedTextPart = memo(function EnhancedTextPart() {
  const { text: rawTextContent } = useMessagePartText()
  // Strip PERSON_PROFILE_FOUND markers and their JSON from the text
  const textContent = useMemo(() => {
    if (!rawTextContent.includes('PERSON_PROFILE_FOUND:')) {
      return rawTextContent
    }

    // Remove all PERSON_PROFILE_FOUND: {...} blocks
    let cleanedText = rawTextContent
    let markerIndex = cleanedText.indexOf('PERSON_PROFILE_FOUND:')

    while (markerIndex !== -1) {
      // Find the opening brace
      const braceStart = cleanedText.indexOf('{', markerIndex)
      if (braceStart === -1) break

      // Count braces to find where the JSON ends
      let braceCount = 0
      let braceEnd = -1
      let inString = false
      let escapeNext = false

      for (let i = braceStart; i < cleanedText.length; i++) {
        const char = cleanedText[i]

        if (escapeNext) {
          escapeNext = false
          continue
        }

        if (char === '\\') {
          escapeNext = true
          continue
        }

        if (char === '"') {
          inString = !inString
          continue
        }

        if (!inString) {
          if (char === '{') braceCount++
          else if (char === '}') {
            braceCount--
            if (braceCount === 0) {
              braceEnd = i + 1
              break
            }
          }
        }
      }

      if (braceEnd === -1) break

      // Remove the PERSON_PROFILE_FOUND:{ ...} block
      cleanedText =
        cleanedText.substring(0, markerIndex) + cleanedText.substring(braceEnd)

      // Look for next marker
      markerIndex = cleanedText.indexOf('PERSON_PROFILE_FOUND:')
    }

    return cleanedText.trim()
  }, [rawTextContent])

  // Parse content for person profile data
  const parsedContent = useMemo(() => {
    const elements: Array<{
      type: 'text' | 'person'
      content: string | PersonProfileData
    }> = []

    // Split RAW text by marker to extract JSON profiles
    const parts = rawTextContent.split('PERSON_PROFILE_FOUND:')

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      if (i === 0) {
        // First part (before any marker, or all content if no marker exists)
        if (part.trim()) {
          elements.push({ type: 'text', content: part.trim() })
        }
      } else {
        // This part comes after a PERSON_PROFILE_FOUND marker
        // Extract the JSON object from the beginning of this part
        const trimmedPart = part.trimStart()

        if (trimmedPart.startsWith('{')) {
          // Find where this JSON object ends by counting braces
          let braceCount = 0
          let jsonEndIndex = 0
          let inString = false
          let escapeNext = false

          for (let j = 0; j < trimmedPart.length; j++) {
            const char = trimmedPart[j]

            if (escapeNext) {
              escapeNext = false
              continue
            }

            if (char === '\\') {
              escapeNext = true
              continue
            }

            if (char === '"') {
              inString = !inString
              continue
            }

            if (!inString) {
              if (char === '{') {
                braceCount++
              } else if (char === '}') {
                braceCount--
                if (braceCount === 0) {
                  jsonEndIndex = j + 1
                  break
                }
              }
            }
          }

          if (jsonEndIndex > 0) {
            const jsonString = trimmedPart.substring(0, jsonEndIndex)
            const remainingText = trimmedPart.substring(jsonEndIndex).trim()

            // Try to parse the JSON
            try {
              const personData = JSON.parse(jsonString) as PersonProfileData
              elements.push({ type: 'person', content: personData })
            } catch (error) {
              console.error('Failed to parse person JSON:', error)
              // If parse fails, just ignore the malformed JSON
            }

            // Add remaining text after the JSON
            if (remainingText) {
              elements.push({ type: 'text', content: remainingText })
            }
          } else {
            // No complete JSON object found, treat as text
            if (trimmedPart) {
              elements.push({ type: 'text', content: trimmedPart })
            }
          }
        } else {
          // No JSON object after marker, treat as text
          if (trimmedPart) {
            elements.push({ type: 'text', content: trimmedPart })
          }
        }
      }
    }

    return elements.length > 0
      ? elements
      : [{ type: 'text', content: textContent }]
  }, [rawTextContent, textContent])

  // Check if we have any person profiles to render
  const hasPersonProfile = parsedContent.some((el) => el.type === 'person')

  // If we found person profiles, render with cards + cleaned text
  if (hasPersonProfile) {
    return (
      <div className="space-y-3">
        {parsedContent.map((element, index) => {
          if (element.type === 'person') {
            return (
              <PersonCard
                key={`person-${index}`}
                person={element.content as PersonProfileData}
                className="my-2"
              />
            )
          } else {
            const txt = (element.content as string).trim()
            if (!txt) return null
            return (
              <div
                key={`text-${index}`}
                className="prose prose-sm dark:prose-invert max-w-none"
              >
                {txt}
              </div>
            )
          }
        })}
      </div>
    )
  }

  // No person profiles — fall back to standard markdown rendering.
  // MarkdownTextPrimitive reads from the same message part context via useMessagePartText internally.
  return (
    <MarkdownTextPrimitive remarkPlugins={[remarkGfm]} className="aui-md" />
  )
})
