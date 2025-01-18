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
  pronouns: string().min(1).optional(),
  location: string().min(1).optional(),
  // MEMBERS ONLY
  status: string().min(1),
  avatar: string().min(1).optional(),
  careManual: string().url().optional(),
  favorites: string().min(1).optional(),
  passions: string().min(1).optional(),
  traits: string().min(1).optional(),
  fieldsOfCare: string().min(1).optional(),
  interests: string().min(1).optional(),
})

export type PersonFormData = z.infer<typeof personSchema>
