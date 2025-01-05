import { PHONE_NUM_REGEX } from '@/utils'
import { object, string } from 'zod'
import * as z from 'zod'

export const personSchema = object({
  firstName: string().min(1).trim(),
  lastName: string().min(1).trim(),
  email: string().email().optional(),
  pronoun: string().min(1).trim().optional(),
  photo: string().url().optional(),
  phone: string().min(1).trim().regex(PHONE_NUM_REGEX).optional(),
})

export type PersonFormData = z.infer<typeof personSchema>
