import { object, string } from 'zod'
import * as z from 'zod'

export const carePointSchema = object({
  name: string().min(1).trim(),
  description: string().min(1).trim().optional(),
  status: string().min(1).trim().optional(),
  why: string().min(1).trim().optional(),
  location: string().min(1).trim().optional(),
  time: string().min(1).trim().optional(),
  levelFulfilled: string().min(1).trim().optional(),
  fulfillmentDate: string().min(1).trim().optional(),
  successMeasures: string().min(1).trim().optional(),
  issuesIdentified: string().min(1).trim().optional(),
  issuesResolved: string().min(1).trim().optional(),

  enabledByGoals: z.array(string().min(1).trim()),
  caresForGoals: z.array(string().min(1).trim()),
})

export type CarePointFormData = z.infer<typeof carePointSchema>
