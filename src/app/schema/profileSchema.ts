import { object, string } from 'zod'
import * as z from 'zod'
import { PHONE_NUM_REGEX, ZIP_CODE_REGEX } from '@/utils'

export const createProfileSchema = object({
  firstName: string().min(1).trim(),
  lastName: string().min(1).trim(),
  email: string().email(),
  address: string().min(1).trim(),
  city: string().min(1).trim(),
  country: string().min(1).trim(),
  county: string().min(1).trim(),
  gender: string().min(1).trim(),
  phone: string().min(1).trim().regex(PHONE_NUM_REGEX), // Example regex for phone number
  state: string().trim().optional(),
  zipPostal: string()
    .trim()
    .optional()
    .refine((val) => val === '' || ZIP_CODE_REGEX.test(val ?? ''), {
      message: 'Invalid zip code',
    }),
})

export type CreateProfileFormData = z.infer<typeof createProfileSchema>
