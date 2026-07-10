'use client'

import {
  useMessagePartText,
  TextMessagePartProvider,
} from '@assistant-ui/react'
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown'
import { defaultComponents } from './markdown-text'
import { PersonCard, PersonProfileData } from './person-card'
import { memo, useMemo } from 'react'
import remarkGfm from 'remark-gfm'
import {
  PERSON_MARKER,
  BLOOM_MARKER,
  stripMarker,
  parsePersonElements,
} from './marker-strip'

/**
 * Custom text message part component.
 *
 * Detects two server-emitted markers in the streamed assistant text:
 *   - `PERSON_PROFILE_FOUND: {…}` → render a PersonCard inline.
 *   - `BLOOM_GRAPH_OVERLAY: {…}`  → strip it from the visible bubble.
 *
 * The Bloom overlay is NO LONGER applied from this text. Applying it here meant
 * rendering whatever `nodes`/`relationships` JSON the MODEL re-serialised into
 * its reply — and LLMs transcribe large payloads unreliably (a 3-node/2-edge
 * result came back as 1 node/0 edges, so the canvas showed only the user).
 * The overlay is now driven off the `query_for_bloom` tool RESULT in
 * `BloomOverlayToolPart` (kb/07 Rule 3 — the tool result is the source of
 * truth). We still STRIP the marker here so any payload the model emits anyway
 * never leaks the raw NVL JSON into the visible bubble (GOAL-280).
 *
 * Why a marker rather than a tool-result subscriber for PersonCard: the
 * assistant-ui runtime renders tool calls/results inside the message bubble but
 * has no clean side-channel into inline prose; PersonCard is interleaved with
 * text, so the marker pattern stays for it.
 */

export const EnhancedTextPart = memo(function EnhancedTextPart() {
  const { text: rawTextContent, status } = useMessagePartText()
  const isRunning = status.type === 'running'

  // Hide the Bloom overlay marker first — including a still-streaming or
  // never-closed payload — so the raw NVL JSON never appears in the bubble
  // (GOAL-280). Person markers are stripped next and split out below so
  // PersonCard can still render inline; doing Bloom first means the payload is
  // gone even in the PersonCard branch.
  const bloomStripped = useMemo(
    () => stripMarker(rawTextContent, BLOOM_MARKER, true),
    [rawTextContent]
  )
  const personStripped = useMemo(
    () => stripMarker(bloomStripped, PERSON_MARKER),
    [bloomStripped]
  )
  const textContent = useMemo(() => personStripped.trim(), [personStripped])

  // Parse person cards off `bloomStripped` (Bloom marker already hidden, PERSON
  // marker still present) — NOT `personStripped`, which has the PERSON marker
  // stripped out, leaving nothing for parsePersonElements to split on (that
  // silently broke card rendering). `textContent` is the fully-stripped
  // fallback when no marker is present.
  const parsedContent = useMemo(
    () => parsePersonElements(bloomStripped, textContent),
    [bloomStripped, textContent]
  )

  const hasPersonProfile = parsedContent.some((el) => el.type === 'person')

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
          }
          const txt = (element.content as string).trim()
          if (!txt) return null
          return (
            <TextMessagePartProvider
              key={`text-${index}`}
              text={txt}
              isRunning={isRunning}
            >
              <MarkdownTextPrimitive
                remarkPlugins={[remarkGfm]}
                className="aui-md"
                components={defaultComponents}
              />
            </TextMessagePartProvider>
          )
        })}
      </div>
    )
  }

  return (
    <TextMessagePartProvider text={textContent} isRunning={isRunning}>
      <MarkdownTextPrimitive
        remarkPlugins={[remarkGfm]}
        className="aui-md"
        components={defaultComponents}
      />
    </TextMessagePartProvider>
  )
})
