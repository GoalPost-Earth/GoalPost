'use client'

import { ReactNode, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { useTheme, ThemeColor } from '@/app/contexts/theme-context'

type SettingSectionProps = {
  icon: string
  title: string
  children: ReactNode
}

type SettingToggleProps = {
  label: string
  description: string
  active?: boolean
}

type SettingSwatchProps = {
  color: string
  ring?: boolean
  themeColor: ThemeColor
  onClick: () => void
}

function SettingSection({ icon, title, children }: SettingSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary text-[20px]">
          {icon}
        </span>
        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-gp-ink-muted dark:text-gp-ink-soft">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

function SettingCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl p-4 transition-all duration-300 border bg-white/40 border-white/60 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:bg-[rgba(20,20,22,0.65)] dark:border-[rgba(255,255,255,0.12)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
      {children}
    </div>
  )
}

function SettingToggle({
  label,
  description,
  active = true,
}: SettingToggleProps) {
  const [isActive, setIsActive] = useState(active)

  return (
    <SettingCard>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-slate-800 dark:text-white">
            {label}
          </h4>
          <p className="text-[11px] text-text-muted dark:text-gp-ink-soft mt-0.5 leading-snug">
            {description}
          </p>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>
    </SettingCard>
  )
}

function SettingSwatch({
  color,
  ring,
  themeColor,
  onClick,
}: SettingSwatchProps) {
  return (
    <div
      className={`w-8 h-8 rounded-full border-2 shadow-sm cursor-pointer transition-transform hover:scale-110 ${
        ring
          ? 'ring-2 ring-primary ring-offset-4 ring-offset-white dark:ring-offset-gray-900'
          : ''
      }`}
      style={{ backgroundColor: color, borderColor: 'rgba(255,255,255,0.2)' }}
      aria-label={`Theme color ${themeColor}`}
      onClick={onClick}
    />
  )
}

export default function SettingsPage() {
  const { themeColor, setThemeColor } = useTheme()

  const themeColors: Array<{ color: string; themeColor: ThemeColor }> = [
    { color: '#0A84FF', themeColor: 'default' },
    { color: '#FFD60A', themeColor: 'warm' },
    { color: '#30D158', themeColor: 'forest' },
    { color: '#BF5AF2', themeColor: 'purple' },
    { color: '#10b981', themeColor: 'emerald' },
  ]

  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_0%_0%,#f0f4ff_0%,transparent_50%),radial-gradient(circle_at_100%_100%,#fdf2f8_0%,transparent_50%),radial-gradient(circle_at_50%_50%,#f8fafc_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_10%_10%,rgba(10,132,255,0.15)_0%,transparent_40%),radial-gradient(circle_at_90%_90%,rgba(191,90,242,0.15)_0%,transparent_40%),radial-gradient(circle_at_50%_50%,#050505_0%,#0c0c0e_100%)] pt-20">
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -top-40 -left-40 w-[320px] h-80 rounded-full bg-blue-300/10 blur-[100px] dark:hidden" />
        <div className="absolute -bottom-40 -right-40 w-[320px] h-80 rounded-full bg-purple-300/10 blur-[100px] dark:hidden" />
        <div className="absolute -top-40 -left-40 w-125 h-125 rounded-full bg-blue-500/10 blur-[120px] hidden dark:block" />
        <div className="absolute -bottom-40 -right-40 w-125 h-125 rounded-full bg-purple-500/10 blur-[120px] hidden dark:block" />
      </div>

      <main className="relative w-full max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-14 bg-white/40 border border-white/60 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:bg-[rgba(20,20,22,0.65)] dark:border-[rgba(255,255,255,0.12)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
          <div className="relative z-10 flex flex-col gap-10">
            <div className="text-center mb-2">
              <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-white mb-2">
                User Settings
              </h1>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted dark:text-gp-ink-soft">
                Personalize your Field experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SettingSection icon="palette" title="Appearance">
                <SettingCard>
                  <label className="text-[10px] font-bold text-text-muted dark:text-gp-ink-soft block mb-4 uppercase tracking-[0.18em]">
                    Theme Color Selector
                  </label>
                  <div className="flex items-center gap-4">
                    {themeColors.map(({ color, themeColor: theme }) => (
                      <SettingSwatch
                        key={theme}
                        color={color}
                        themeColor={theme}
                        ring={themeColor === theme}
                        onClick={() => setThemeColor(theme)}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-[11px] text-text-muted dark:text-gp-ink-soft leading-relaxed">
                    Choose a primary essence for your atmosphere.
                  </p>
                </SettingCard>
              </SettingSection>

              <SettingSection icon="motion_blur" title="Dynamics">
                <SettingToggle
                  label="Animations"
                  description="Fluid UI transitions and field drifts"
                  active
                />
                <SettingToggle
                  label="Haptic Echo"
                  description="Subtle feedback on gesture interaction"
                  active={false}
                />
              </SettingSection>

              <SettingSection icon="sensors" title="Presence">
                <SettingToggle
                  label="Field Notifications"
                  description="Real-time alerts for community activity"
                  active
                />
              </SettingSection>

              <SettingSection icon="hub" title="Coherence">
                <SettingToggle
                  label="Semantic Linkage"
                  description="Auto-discover patterns between fields"
                  active
                />
              </SettingSection>
            </div>

            <div className="flex items-center justify-center gap-4 md:gap-6 mt-2 flex-wrap">
              <button className="px-8 py-3 rounded-full bg-white/50 border border-white/60 text-slate-600 font-medium shadow-sm transition-all hover:bg-white/80 dark:bg-white/15 dark:border-white/30 dark:text-white dark:hover:bg-white/25 cursor-pointer">
                Discard
              </button>
              <button className="px-10 py-3 rounded-full bg-primary text-white dark:text-gray-800 font-semibold transition-all shadow-[0_0_20px_rgba(10,132,255,0.3)] hover:shadow-[0_0_35px_rgba(10,132,255,0.5)] hover:scale-[1.02] dark:shadow-[0_0_25px_rgba(10,132,255,0.5)] cursor-pointer">
                Save Changes
              </button>
            </div>
          </div>

          <div className="absolute top-10 right-10 size-16 rounded-full bg-white/20 border border-white/40 backdrop-blur-sm pointer-events-none" />
          <div className="absolute bottom-16 left-10 size-12 rounded-full bg-white/20 border border-white/40 backdrop-blur-sm pointer-events-none" />
        </div>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-white/40 border border-white/60 backdrop-blur-2xl shadow-xl dark:bg-black/40 dark:border-white/10">
          <button className="size-10 flex items-center justify-center rounded-full text-slate-500 hover:text-primary transition-colors dark:text-text-muted dark:hover:text-white">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="w-px h-4 bg-slate-300/50 dark:bg-white/10" />
          <button className="size-10 flex items-center justify-center rounded-full text-slate-500 hover:text-primary transition-colors dark:text-text-muted dark:hover:text-rose-400">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
