'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client/react'
import { GET_LOGGED_IN_USER } from '@/app/graphql/queries/DASHBOARD_QUERIES'
import { UPDATE_PERSON_MUTATION } from '@/app/graphql/mutations/PERSON_MUTATIONS'
import { useApp, usePageContext } from '@/contexts'

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function EditProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useApp()
  const { setPageTitle } = usePageContext()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    pronouns: '',
    location: '',
    passions: '',
    traits: '',
    photo: '',
    fieldsOfCare: '',
  })

  const { data, loading: queryLoading } = useQuery<any>(
    GET_LOGGED_IN_USER as any,
    {
      variables: { email: user?.email ?? '' },
      skip: !user?.email,
      fetchPolicy: 'cache-and-network',
    }
  )

  const [updatePerson, { loading: mutationLoading }] = useMutation<any>(
    UPDATE_PERSON_MUTATION as any,
    {
      refetchQueries: [
        {
          query: GET_LOGGED_IN_USER as any,
          variables: { email: user?.email ?? '' },
        },
      ],
    }
  )

  useEffect(() => {
    setPageTitle('Edit Profile')
  }, [setPageTitle])

  useEffect(() => {
    if (!isAuthenticated && !queryLoading) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, queryLoading, router])

  useEffect(() => {
    const personData = data?.people?.[0]
    if (personData) {
      // Parse full name into firstName and lastName
      const nameParts = (personData.name || '').trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      setFormData({
        firstName,
        lastName,
        phone: personData.phone || '',
        pronouns: personData.pronouns || '',
        location: personData.location || '',
        passions: personData.passions || '',
        traits: personData.traits || '',
        photo: personData.photo || '',
        fieldsOfCare: personData.fieldsOfCare || '',
      })
    }
  }, [data])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const personData = data?.people?.[0]
    if (!personData) return

    try {
      await updatePerson({
        variables: {
          where: { id_EQ: personData.id },
          update: {
            firstName_SET: formData.firstName,
            lastName_SET: formData.lastName,
            phone_SET: formData.phone || null,
            pronouns_SET: formData.pronouns || null,
            location_SET: formData.location || null,
            passions_SET: formData.passions || null,
            traits_SET: formData.traits || null,
            photo_SET: formData.photo || null,
            fieldsOfCare_SET: formData.fieldsOfCare || null,
          },
        },
      })

      router.push('/protected/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  if (queryLoading) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors p-8 pt-28">
        <div className="max-w-4xl mx-auto w-full space-y-8 animate-pulse">
          <div className="chat-card rounded-2xl p-8">
            <div className="space-y-3">
              <div className="h-8 w-48 bg-slate-200 rounded dark:bg-slate-700"></div>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-full bg-slate-200 rounded dark:bg-slate-700"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const personData = data?.people?.[0]

  if (!personData) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors p-8">
        <div className="max-w-4xl mx-auto w-full">
          <div className="p-6 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-300">
            Profile data not found. Please try logging in again.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full overflow-auto bg-gp-surface dark:bg-gp-surface-dark transition-colors p-8 pt-28">
      {/* Loading Overlay */}
      {mutationLoading && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gp-surface-dark rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-gp-primary/20 dark:border-gp-primary/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gp-primary dark:border-t-gp-primary animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gp-ink-strong dark:text-white">
                Saving Changes
              </p>
              <p className="text-sm text-gp-ink-muted dark:text-white/60 mt-1">
                Please wait while we update your profile...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="chat-card rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gp-ink-strong dark:text-white">
                Edit Profile
              </h1>
              <p className="text-sm text-gp-ink-muted dark:text-white/60 mt-1">
                Update your profile information
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="chat-card rounded-2xl p-8">
            <h2 className="text-lg font-bold text-gp-ink-strong dark:text-white mb-6">
              Basic Information
            </h2>

            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-gp-ink-strong dark:text-white mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={mutationLoading}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:border-gp-primary dark:focus:border-gp-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your first name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-gp-ink-strong dark:text-white mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={mutationLoading}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:border-gp-primary dark:focus:border-gp-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your last name"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gp-ink-strong dark:text-white mb-2"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={mutationLoading}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:border-gp-primary dark:focus:border-gp-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Photo URL */}
              <div>
                <label
                  htmlFor="photo"
                  className="block text-sm font-semibold text-gp-ink-strong dark:text-white mb-2"
                >
                  Photo URL
                </label>
                <input
                  type="url"
                  id="photo"
                  name="photo"
                  value={formData.photo}
                  onChange={handleChange}
                  disabled={mutationLoading}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:border-gp-primary dark:focus:border-gp-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter photo URL"
                />
              </div>

              {/* Pronouns */}
              <div>
                <label
                  htmlFor="pronouns"
                  className="block text-sm font-semibold text-gp-ink-strong dark:text-white mb-2"
                >
                  Pronouns
                </label>
                <input
                  type="text"
                  id="pronouns"
                  name="pronouns"
                  value={formData.pronouns}
                  onChange={handleChange}
                  disabled={mutationLoading}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:border-gp-primary dark:focus:border-gp-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g., they/them"
                />
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-semibold text-gp-ink-strong dark:text-white mb-2"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={mutationLoading}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:border-gp-primary dark:focus:border-gp-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your location"
                />
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="chat-card rounded-2xl p-8">
            <h2 className="text-lg font-bold text-gp-ink-strong dark:text-white mb-6">
              Profile Details
            </h2>

            <div className="space-y-6">
              {/* Passions */}
              <div>
                <label
                  htmlFor="passions"
                  className="block text-sm font-semibold text-gp-ink-strong dark:text-white mb-2"
                >
                  Passions
                </label>
                <textarea
                  id="passions"
                  name="passions"
                  value={formData.passions}
                  onChange={handleChange}
                  disabled={mutationLoading}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:border-gp-primary dark:focus:border-gp-primary transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="What are you passionate about?"
                />
              </div>

              {/* Traits */}
              <div>
                <label
                  htmlFor="traits"
                  className="block text-sm font-semibold text-gp-ink-strong dark:text-white mb-2"
                >
                  Traits
                </label>
                <textarea
                  id="traits"
                  name="traits"
                  value={formData.traits}
                  onChange={handleChange}
                  disabled={mutationLoading}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:border-gp-primary dark:focus:border-gp-primary transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Describe your key traits and characteristics"
                />
              </div>

              {/* Fields of Care */}
              <div>
                <label
                  htmlFor="fieldsOfCare"
                  className="block text-sm font-semibold text-gp-ink-strong dark:text-white mb-2"
                >
                  Fields of Care
                </label>
                <textarea
                  id="fieldsOfCare"
                  name="fieldsOfCare"
                  value={formData.fieldsOfCare}
                  onChange={handleChange}
                  disabled={mutationLoading}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:border-gp-primary dark:focus:border-gp-primary transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="What areas do you care about?"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={mutationLoading}
              className="px-6 py-2 rounded-lg text-sm font-semibold border border-gp-primary/30 text-gp-primary hover:bg-gp-primary/5 transition-all dark:text-gp-primary dark:border-gp-primary/40 dark:hover:bg-gp-primary/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutationLoading}
              className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--gp-primary) 85%, white 15%), color-mix(in srgb, var(--gp-primary) 65%, black 35%))',
              }}
            >
              <span className="material-symbols-outlined text-[16px]">
                {mutationLoading ? 'hourglass_empty' : 'save'}
              </span>
              {mutationLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
