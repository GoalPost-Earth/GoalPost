import { object, string } from 'zod'
import * as z from 'zod'

export const goalSchema = object({
  name: string().min(1).trim(),
  description: string().min(1).trim(),
  successMeasures: string().min(1).trim(),
  photo: string().min(1).trim().optional(),
  status: string().min(1).trim(),
  location: string().min(1).trim().optional(),
  time: string().min(1).trim().optional(),
})

export type GoalFormData = z.infer<typeof goalSchema>
