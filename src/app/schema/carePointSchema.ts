import { object, string } from 'zod'
import * as z from 'zod'

export const carePointSchema = object({
  description: string().min(1).trim(),
  status: string().min(1).trim().optional(),
})

export type CarePointFormData = z.infer<typeof carePointSchema>
