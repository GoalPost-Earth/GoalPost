import { object, string } from 'zod'
import * as z from 'zod'

export const carePointSchema = object({
  name: string().min(1).trim(),
  description: string().trim().optional(),
  status: string().min(1).trim(),
  why: string().trim().optional(),
  location: string().trim().optional(),
  time: string().trim().optional(),
  levelFulfilled: string().trim().optional(),
  fulfillmentDate: string().trim().optional(),
  successMeasures: string().trim().optional(),
  issuesIdentified: string().trim().optional(),
  issuesResolved: string().trim().optional(),

  enabledByGoals: z.array(string().min(1).trim()),
  caresForGoals: z.array(string().min(1).trim()),
  resources: z.array(string().min(1).trim()),
})

export type CarePointFormData = z.infer<typeof carePointSchema>
