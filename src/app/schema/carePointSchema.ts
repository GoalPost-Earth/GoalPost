import { object, string } from 'zod'
import * as z from 'zod'

export const carePointSchema = object({
  name: string().min(1).trim(),
  description: string().min(1).trim().optional(),
  status: string().min(1).trim().optional(),
  enabledByGoals: string().min(1).trim(),
  caresForGoals: string().min(1).trim(),
})

export type CarePointFormData = z.infer<typeof carePointSchema>
