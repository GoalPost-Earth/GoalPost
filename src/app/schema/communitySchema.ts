import { object, string } from 'zod'
import * as z from 'zod'

export const communitySchema = object({
  name: string().min(1).trim(),
  description: string().trim().optional(),
  status: string().trim(),
  why: string().trim().optional(),
  location: string().trim().optional(),
  time: string().trim().optional(),
})

export type CommunityFormData = z.infer<typeof communitySchema>
