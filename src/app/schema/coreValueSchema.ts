import { object, string } from 'zod'
import * as z from 'zod'

export const coreValueSchema = object({
  name: string().min(1).trim(),
  description: string().trim().optional(),
  alignmentExamples: string().trim().optional(),
  alignmentChallenges: string().trim().optional(),
  why: string().trim().optional(),
  linkTo: string().min(1).trim(),
  communityLink: string()
    .min(1, 'You must choose a community')
    .trim()
    .optional(),
  personLink: string().min(1, 'You must choose a person').trim().optional(),
})

export type CoreValueFormData = z.infer<typeof coreValueSchema>
