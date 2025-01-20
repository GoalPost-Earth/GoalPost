import { object, string } from 'zod'
import * as z from 'zod'

export const goalSchema = object({
  name: string().min(1).trim(),
  description: string().trim().optional(),
  successMeasures: string().trim().optional(),
  photo: string().trim().optional(),
  status: string().min(1).trim(),
  location: string().trim().optional(),
  why: string().trim().optional(),
  time: string().trim().optional(),
  linkTo: string().min(1).trim(),
  communityLink: string()
    .min(1, 'You must choose a community')
    .trim()
    .optional(),
  personLink: string().min(1, 'You must choose a person').trim().optional(),
})

export type GoalFormData = z.infer<typeof goalSchema>
