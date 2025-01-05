import { object, string } from 'zod'
import * as z from 'zod'

export const coreValueSchema = object({
  name: string().min(1).trim(),
  description: string().min(1).trim(),
  alignmentExamples: string().min(1).trim(),
  alignmentChallenges: string().min(1).trim(),
  whoSupports: string().min(1).trim(),
  why: string().min(1).trim(),
})

export type CoreValueFormData = z.infer<typeof coreValueSchema>
