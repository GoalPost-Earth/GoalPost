import { object, string } from 'zod'
import * as z from 'zod'

export const resourceSchema = object({
  name: string().min(1).trim(),
  description: string().trim().optional(),
  status: string().trim().optional(),
  why: string().trim().optional(),
  location: string().trim().optional(),
  time: string().trim().optional(),
})

export type ResourceFormData = z.infer<typeof resourceSchema>
