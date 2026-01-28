'use client'

// import { useParams } from 'next/navigation'
import Image from 'next/image'
import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import { ResonanceBadge } from '@/components/persons/resonance-badge'

// Mock data - replace with actual data fetching
const mockPersonData = {
  id: 'person_123',
  name: 'Elena Vance',
  title: 'Relational Steward',
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBx9ZOiwisaENVTbOXfWoN6xW7bTE3gq4YNmICtCSPWmUiVbG4grZBPRaRtj8DMtLuj5TczUBCRWH7jrybunppIXsMHtE_decuSpL3MZ-IXKIZOC9vyXQRGVbgFtNPnBnqYzhpQ316h4-apk1p5DMqZ8ZMBpgED3zGmp59v45_tzsuYn3YDB8wRPca14sG_2uaqhXnBP5pRP9IHHupgam8XUfhkhZdsSULavnSZuRXKw03NL7gU1BBayPSIJmZLEQg-N-elbANgMLIB',
  presence: {
    status: 'Attending the Commons',
    active: true,
    fields: [
      { name: 'Watershed Restoration', active: true },
      { name: 'Cognitive Mycelium', active: false },
    ],
  },
  offerings: [
    {
      title: 'River Song Pulse',
      type: 'Story',
      description: 'A reflection on the seasonal shift of the basin.',
    },
    {
      title: 'Seed Bank Alpha',
      type: 'Goal',
      description: 'Collecting 40 endemic species by solstice.',
    },
  ],
  resonances: [
    { label: 'Ecological Care', icon: 'water_drop' },
    { label: 'Bio-Regioning', icon: 'landscape' },
    { label: 'Kinship Logic', icon: 'diversity_2' },
  ],
  resonanceInsight:
    '"AI observes a high coherence between Elena\'s pulses and systemic health indicators."',
  intentions:
    'To listen where the land is quiet, to weave the threads of human agency into the tapestry of the wild, and to be a steward for the unseen connections that sustain us all.',
}

export default function PersonProfilePage() {
  //   const params = useParams()
  //   const personId = params?.id as string

  return (
    <div
      className="relative min-h-screen overflow-y-auto overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20"
      style={{
        backgroundImage: `
          radial-gradient(at 18% 18%, color-mix(in srgb, var(--gp-primary) 12%, transparent) 0, transparent 55%),
          radial-gradient(at 82% 16%, color-mix(in srgb, var(--gp-accent-glow) 12%, transparent) 0, transparent 55%),
          radial-gradient(at 80% 85%, color-mix(in srgb, var(--gp-goal) 10%, transparent) 0, transparent 60%),
          radial-gradient(at 16% 86%, color-mix(in srgb, var(--gp-resource) 12%, transparent) 0, transparent 60%)
        `,
      }}
    >
      {/* Animated backdrop blobs */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[320px] h-80 rounded-full bg-gp-primary/12 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[320px] h-80 rounded-full bg-gp-accent-glow/12 blur-[120px] animate-float-delayed" />
      </div>

      <main className="relative w-full max-w-4xl mx-auto px-4 py-16 md:py-24">
        {/* Main Profile Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-14 bg-gp-glass-bg border border-gp-glass-border shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          <div className="relative z-10">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center mb-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gp-primary/20 blur-2xl rounded-full" />
                <div className="relative size-32 rounded-full border-4 border-white/20 dark:border-white/10 overflow-hidden shadow-2xl">
                  <Image
                    alt={mockPersonData.name}
                    className="w-full h-full object-cover"
                    src={mockPersonData.avatar}
                    width={500}
                    height={500}
                  />
                </div>
              </div>
              <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
                {mockPersonData.name}
              </h1>
              <p className="text-gp-primary text-xs uppercase tracking-[0.3em] font-bold">
                {mockPersonData.title}
              </p>
            </div>

            {/* Grid Layout - Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Presence Section */}
              <div className="flex flex-col gap-4">
                <SectionHeader icon="sensors" title="Presence" />
                <ProfileCard>
                  <div className="flex items-center mb-4 gap-2">
                    <span className="size-2 rounded-full bg-gp-accent-glow shadow-[0_0_8px_rgba(79,255,203,0.8)]" />
                    <span className="text-sm font-medium text-gp-ink-strong dark:text-white">
                      {mockPersonData.presence.status}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {mockPersonData.presence.fields.map((field) => (
                      <div
                        key={field.name}
                        className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                          field.active
                            ? 'bg-gp-primary/10 dark:bg-gp-primary/20'
                            : 'bg-gp-ink-muted/5 dark:bg-gp-ink-soft/5'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-sm ${
                            field.active
                              ? 'text-gp-primary'
                              : 'text-gp-ink-muted dark:text-gp-ink-soft'
                          }`}
                        >
                          {field.active ? 'water_drop' : 'psychology'}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            field.active
                              ? 'text-gp-ink-strong dark:text-white'
                              : 'text-gp-ink-muted dark:text-gp-ink-soft'
                          }`}
                        >
                          {field.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </ProfileCard>
              </div>

              {/* Offerings Section */}
              <div className="flex flex-col gap-4">
                <SectionHeader icon="auto_awesome" title="Offerings" />
                <ProfileCard>
                  <div className="space-y-4">
                    {mockPersonData.offerings.map((offering, idx) => (
                      <div
                        key={idx}
                        className={
                          idx > 0 ? 'border-t border-gp-glass-border pt-3' : ''
                        }
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                            {offering.title}
                          </h4>
                          <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                            {offering.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
                          {offering.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </ProfileCard>
              </div>

              {/* Resonance Section */}
              <div className="flex flex-col gap-4">
                <SectionHeader icon="waves" title="Resonance" />
                <ProfileCard>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mockPersonData.resonances.map((resonance) => (
                      <ResonanceBadge
                        key={resonance.label}
                        label={resonance.label}
                        variant={
                          resonance.label === 'Ecological Care'
                            ? 'primary'
                            : 'secondary'
                        }
                        icon={resonance.icon}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft italic leading-relaxed">
                    {mockPersonData.resonanceInsight}
                  </p>
                </ProfileCard>
              </div>

              {/* Intentions Section */}
              <div className="flex flex-col gap-4">
                <SectionHeader icon="flare" title="Intentions" />
                <ProfileCard>
                  <p className="text-[13px] text-gp-ink-strong dark:text-gp-ink-strong leading-relaxed font-light italic">
                    {mockPersonData.intentions}
                  </p>
                </ProfileCard>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-6 w-full">
              <button className="px-8 py-3 rounded-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sm shadow-sm">
                View Field
              </button>
              <button className="px-10 py-3 rounded-full bg-gp-primary text-white font-semibold hover:shadow-[0_8px_25px_rgba(var(--gp-primary-rgb),0.4)] hover:scale-[1.02] transition-all text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  bolt
                </span>
                Pulse {mockPersonData.name.split(' ')[0]}
              </button>
            </div>
          </div>

          {/* Decorative blobs inside card */}
          <div className="absolute top-10 right-10 size-16 rounded-full bg-gp-primary/10 border border-gp-glass-border backdrop-blur-sm pointer-events-none" />
          <div className="absolute bottom-16 left-10 size-12 rounded-full bg-gp-accent-glow/10 border border-gp-glass-border backdrop-blur-sm pointer-events-none" />
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-gp-glass-bg border border-gp-glass-border backdrop-blur-2xl shadow-xl dark:shadow-2xl">
          <button className="size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors hover:bg-gp-primary/10 dark:hover:bg-gp-primary/20">
            <span className="material-symbols-outlined">message</span>
          </button>
          <div className="w-px h-4 bg-gp-glass-border" />
          <button className="size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors hover:bg-gp-primary/10 dark:hover:bg-gp-primary/20">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </div>
    </div>
  )
}
