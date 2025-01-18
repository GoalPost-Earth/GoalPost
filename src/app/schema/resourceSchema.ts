import { object, string } from 'zod'
import * as z from 'zod'

export const resourceSchema = object({
  name: string().min(1).trim(),
  description: string().trim().optional(),
  status: string().trim(),
  why: string().trim().optional(),
  location: string().trim().optional(),
  time: string().trim().optional(),
  linkTo: string().min(1).trim(),
  communityLink: string()
    .min(1, 'You must choose a community')
    .trim()
    .optional(),
  personLink: string().min(1, 'You must choose a person').trim().optional(),
})

export type ResourceFormData = z.infer<typeof resourceSchema>
