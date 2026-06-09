import type { NodeType } from '@/lib/pulse-type-config'

// Lightweight keyword heuristic that suggests a pulse type from free text.
// Used only to pre-highlight a type pill in the create composer — the user can
// always override it, so this is a convenience, not a classifier of record.

const GOAL_KEYWORDS = [
  'achieve',
  'complete',
  'finish',
  'accomplish',
  'target',
  'aim',
  'goal',
  'want to',
  'need to',
  'should',
  'expand',
  'improve',
  'increase',
  'grow',
  'build',
  'create',
  'develop',
  'learn',
  'master',
]

const RESOURCE_KEYWORDS = [
  'tool',
  'resource',
  'material',
  'data',
  'dataset',
  'database',
  'file',
  'document',
  'template',
  'library',
  'framework',
  'code',
  'software',
  'application',
  'platform',
  'service',
  'api',
]

const STORY_KEYWORDS = [
  'journey',
  'experience',
  'story',
  'narrative',
  'lesson',
  'insight',
  'learning',
  'reflection',
  'memory',
  'moment',
  'event',
  'happened',
  'discovered',
  'realized',
  'found',
  'understand',
]

export function inferPulseType(input: string): {
  type: NodeType
  suggestedName: string
} {
  const lowerInput = input.toLowerCase()

  const goalScore = GOAL_KEYWORDS.filter((kw) => lowerInput.includes(kw)).length
  const resourceScore = RESOURCE_KEYWORDS.filter((kw) =>
    lowerInput.includes(kw)
  ).length
  const storyScore = STORY_KEYWORDS.filter((kw) =>
    lowerInput.includes(kw)
  ).length

  let type: NodeType = 'goal'
  if (
    storyScore >= goalScore &&
    storyScore >= resourceScore &&
    storyScore > 0
  ) {
    type = 'story'
  } else if (resourceScore > goalScore && resourceScore > storyScore) {
    type = 'resource'
  } else {
    type = 'goal'
  }

  // Derive a tidy suggested title from the first few words of the input.
  const suggestedName =
    input
      .trim()
      .split(' ')
      .slice(0, 4)
      .join(' ')
      .replace(/^(i want to|i need to|i should|i want|i have|a|an|the)\s+/i, '')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Untitled Pulse'

  return { type, suggestedName }
}
