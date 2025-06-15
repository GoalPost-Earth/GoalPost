import { object, string } from 'zod'
import * as z from 'zod'

export const personSchema = object({
  firstName: string().min(1).trim(),
  lastName: string().min(1).trim(),
  email: string().email().optional(),
  photo: string().url().optional(),
  phone: string()
    .trim()
    // .regex(PHONE_NUM_REGEX, 'Please enter your phone number with country code')
    .optional(),
  pronouns: string().optional(),
  location: string().optional(),
  // MEMBERS ONLY
  status: string().min(1),
  avatar: string().optional(),
  careManual: string().optional(),
  favorites: string().optional(),
  passions: string().optional(),
  traits: string().optional(),
  fieldsOfCare: string().optional(),
  interests: string().optional(),
  community: string().optional(), // <-- Add this line
})

export type PersonFormData = z.infer<typeof personSchema>
